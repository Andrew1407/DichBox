import IBoxesClientDB from './IBoxesClientDB';
import IClientDB from '../IClientDB';
import { BoxData, UserData } from '../../datatypes';

export default class BoxesClientDB implements IBoxesClientDB {
  constructor(protected readonly daoClient: IClientDB) { }

  public async getUserId(name: string|null): Promise<number> {
    return await this.daoClient.getUserId(name);
  }

  public async getBoxesList(
    viewerName: string|null,
    boxOwnerName: string
  ): Promise<BoxData[]> {
    const follower: boolean = await this.checkFollower(boxOwnerName, viewerName);
    const ownPage: boolean = viewerName === boxOwnerName;
    const viewerId: number = await this.daoClient.getUserId(viewerName);
    const boxOwnerId: number = ownPage ? viewerId :
      await this.daoClient.getUserId(boxOwnerName);
    const getters: Promise<BoxData[]>[] = ownPage ?
      [
        this.getUserOwnBoxes(boxOwnerId),
        this.getUserInveteeBoxes(boxOwnerId)
      ] :
      [
        this.getVisitorBoxes(boxOwnerId, follower),
        this.getLimitedBoxes(viewerId, boxOwnerId)
      ];
    const queries: BoxData[][] = await Promise.all(getters);
    const flatLists = (acc: BoxData[], arr: BoxData[]): BoxData[] => acc.concat(arr);
    const boxesList: BoxData[] = queries.reduce(flatLists, []);
    return boxesList;
  }

  private async getLimitedBoxes(
    person_id: number,
    owner_id: number
  ): Promise<BoxData[]> {
    const output: string[] = [
      'c.name as owner_name',
      'b.name',
      'b.name_color',
      'access_level'
    ];
    const sharedBoxes: BoxData[] = await this.daoClient.selectDoubleJoinedValues(
      ['limited_viewers', 'boxes', 'users'],
      ['b.id = a.box_id', 'b.owner_id = c.id'],
      { owner_id, person_id },
      output,
      'order by last_edited desc'
    );
    return sharedBoxes;
  }

  private async getUserOwnBoxes(owner_id: number): Promise<BoxData[]> {
    const returnColumns: string[] = 
      [
        'b.name as owner_name',
        'a.name',
        'a.name_color',
        'access_level'
      ];
    const userBoxes: BoxData[] = await this.daoClient.selectJoinedValues(
      ['boxes', 'users'],
      ['owner_id', 'id'],
      { owner_id },
      returnColumns,
      'order by last_edited desc'
    );
    return userBoxes;
  }

  private async checkFollower(
    name: string,
    subscriber: string|null
  ): Promise<boolean> {
    if (!subscriber) return false;
    const nameId: number = await this.daoClient.getUserId(name);
    if (!nameId) return false;
    const foundResult: number[]|null = await this.daoClient.selectJoinedValues(
      ['subscribers', 'users'],
      ['person_id', 'id'],
      { subscription: nameId, name: subscriber },
      ['id']
    );
    return !!foundResult.length;
  }

  private async getVisitorBoxes(
    owner_id: number,
    follower: boolean
  ): Promise<BoxData[]> {
    const boxesAccess: string[] = ['public'];
    if (follower)
      boxesAccess.push('followers');
    const selectCondition: string = boxesAccess
      .map(x => `access_level = '${x}'`)
      .join(' or ');
    const returnColumns: string[] = [
      'b.name as owner_name',
      'a.name as name',
      'a.name_color as name_color',
      'access_level'
    ];
    const visitorBoxes: BoxData[] =  await this.daoClient.selectJoinedValues(
      ['boxes', 'users'],
      ['owner_id', 'id'],
      { owner_id },
      returnColumns,
      `and (${selectCondition}) order by last_edited desc`
    );
    return visitorBoxes;
  }

  private async getUserInveteeBoxes(person_id: number): Promise<BoxData[]> {
    const returnColumns: string[] = [
      'c.name as owner_name',
      'a.name',
      'a.name_color',
      '\'invetee\' as access_level'
    ];
    const inveteeBoxes: BoxData[] = await this.daoClient.selectDoubleJoinedValues(
      ['boxes', 'box_editors', 'users'],
      ['a.id = b.box_id', 'a.owner_id = c.id'],
      { person_id },
      returnColumns,
      'order by last_edited desc'
    );
    return inveteeBoxes;
  }

  private async getUsersIds(usernames: string[]): Promise<number[]> {
    const namesList: string = usernames
      .map((x: string): string => `'${x}'`)
      .join(', ');
    const res: UserData[] = await this.daoClient.rawQuery(
      `select id from users where name in (${namesList});`
    );
    const ids: number[] = res.map(
      (x: UserData): number => x.id
    );
    return ids;
  }

  private async boxInfoGetter(
    actionType: string,
    boxName: string,
    person_id: number,
    owner_id: number,
    follower: boolean,
    editor: boolean
  ): Promise<BoxData|null> {
    const viewPermitted: boolean = (person_id === owner_id) || editor;
    const returnColumns: string[] = [
      'a.name',
      'a.name_color',
      'b.name as owner_name',
      'b.name_color as owner_nc',
      'a.reg_date',
      'last_edited',
      'a.description',
      'a.description_color'
    ];
    type gettersFns = {
      public: () => Promise<BoxData|null>,
      private: () => Promise<BoxData|null>,
      followers: () => Promise<BoxData|null>,
      limited: () => Promise<BoxData|null>,
    };
    const getters: gettersFns = {
      public: async (): Promise<BoxData|null> => {
        const box: BoxData[] = await this.daoClient.selectJoinedValues(
          ['boxes', 'users'],
          ['owner_id', 'id'],
          { owner_id },
          returnColumns,
          `and a.name = '${boxName}'`
        );
        return box.length ? box[0] : null;
      },
      private: async (): Promise<BoxData|null> => {
        return viewPermitted ?
          await getters.public() : null;
      },
      followers: async (): Promise<BoxData|null> => {
        return viewPermitted || follower ?
          await getters.public() : null;
      },
      limited: async (): Promise<BoxData|null> => {
        if (viewPermitted)
          return await getters.public();
        const box: BoxData[] = await this.daoClient.selectDoubleJoinedValues(
          ['boxes', 'users', 'limited_viewers'],
          ['a.owner_id = b.id', 'a.id = c.box_id'],
          { owner_id, person_id },
          returnColumns
        );
        return box.length ? box[0] : null;
      }
    };
    return await getters[actionType]();
  }

  public async getBoxInfo(
    boxName: string,
    viewerName: string|null,
    ownerName: string
  ): Promise<BoxData|null> {
    const follower: boolean = await this.checkFollower(ownerName, viewerName)
    const ownPage: boolean = viewerName === ownerName;
    const owner_id: number = await this.daoClient.getUserId(ownerName);
    const viewer_id: number = ownPage ? owner_id :
      await this.daoClient.getUserId(viewerName);
    const typeRes: BoxData[]|null = await this.daoClient.selectValues(
      'boxes', { owner_id, name: boxName }, ['id', 'access_level']
    );
    if (!typeRes) return null;
    const boxId: number = typeRes[0].id;
    const editor: boolean = ownPage ? ownPage :
      await this.checkEditor(boxId, viewer_id);
    const boxType: string = typeRes[0].access_level;
    const box: BoxData|null =  await this.boxInfoGetter(
      boxType, boxName, viewer_id, owner_id, follower, editor
    );
    return box ? { ...box, ...typeRes[0], editor, owner_id } : null;  
  }

  private async checkEditor(
    box_id: number,
    person_id: number|null
  ): Promise<boolean> {
    if (!(box_id && person_id)) return false
    const foundValue: { box_id: number }[]|null = await this.daoClient.selectValues(
      'box_editors', { box_id, person_id }, ['box_id']
    );
    return !!foundValue;
  }

  private async insertPermissions(
    table: string,
    box_id: number,
    usernames: string[],
  ): Promise<void> {
    const ids: number[] = await this.getUsersIds(usernames);
    const values: string[] = ids.map(id => `($1, ${id})`);
    await this.daoClient.rawQuery(
      `insert into ${table} (box_id, person_id) values ${values};`,
      [box_id]
    );
  }

  public async insertBox(
    ownerName: string,
    boxData: BoxData,
    limitedUsers: string[]|null,
    editors: string[]|null
  ): Promise<BoxData|null> {
    const owner_id: number = await this.daoClient.getUserId(ownerName);
    const insertedBox: BoxData =
      await this.daoClient.insertValue(
        'boxes',
        { ...boxData, owner_id },
        ['name', 'id', 'owner_id']
      );
    if (limitedUsers?.length)
      await this.insertPermissions('limited_viewers', insertedBox.id, limitedUsers);
    if (editors?.length)
      await this.insertPermissions('box_editors', insertedBox.id, editors);
    return insertedBox;
  }

  public async findUserBox(
    username: string,
    boxName: string
  ): Promise<BoxData|null> {
    const res: BoxData[]|null =  await this.daoClient.selectJoinedValues(
      ['boxes', 'users'],
      ['owner_id', 'id'],
      {}, ['a.name'],
      `a.name = '${boxName}' and b.name = '${username}'`
    );
    return res.length ? res[0] : null;
  }

  public async updateBox(
    ownerName: string,
    boxName: string,
    boxData: BoxData,
    limitedlist: string[]|null = null,
    editorslist: string[]|null = null
  ): Promise<BoxData|null> {
    const beforeUpdateRes: BoxData[] = await this.daoClient.selectJoinedValues(
      ['boxes', 'users'],
      ['owner_id', 'id'],
      {}, ['a.id', 'access_level'],
      `a.name = '${boxName}' and b.name = '${ownerName}'`
    );
    if (!beforeUpdateRes.length) return null;
    const [ beforeUpdate ]: BoxData[] = beforeUpdateRes;
    const foundColumns: string[] = ['last_edited', 'owner_id'];
    if (boxData) foundColumns.push(...Object.keys(boxData));
    if (!foundColumns.includes('access_level'))
      foundColumns.push('access_level');
    const updated: BoxData = await this.daoClient.updateValueById(
      'boxes',
      beforeUpdate.id,
      { ...boxData, last_edited: 'now()' },
      foundColumns
    );
    if (editorslist) await ( editorslist.length ?
      this.updateAccessList('box_editors', beforeUpdate.id, editorslist) :
      this.daoClient.removeValue('box_editors', { box_id: beforeUpdate.id })
    );
    const isLimited = (x: string): boolean => x === 'limited';
    const [ limitedNew, limitedOld ]: boolean[] =
      [updated.access_level, beforeUpdate.access_level].map(isLimited);
    if (!limitedNew && !limitedOld)
      return { ...updated, id: beforeUpdate.id };
    const [ wasLimited, setLimited, remainedLimited ]: boolean[] = [
      limitedOld && !limitedNew,
      !limitedOld && limitedNew,
      limitedOld && limitedNew,
    ];
    const cleanList = async (box_id: number): Promise<void> => {
      await this.daoClient.removeValue('limited_viewers', { box_id });
    };
    if (wasLimited) {
      await cleanList(beforeUpdate.id);
    } else if (limitedlist) {
      if (setLimited && limitedlist.length)
        await this.insertPermissions('limited_viewers', beforeUpdate.id, limitedlist);
      else if (remainedLimited)
        await ( limitedlist.length ?
          this.updateAccessList('limited_viewers', beforeUpdate.id, limitedlist) :
          cleanList(beforeUpdate.id)
        );
    }
    return { ...updated, id: beforeUpdate.id };
  }
    
  private async updateAccessList(
    table: string,
    box_id: number,
    usernames: string[]
  ): Promise<void> {
    const currentList: { person_id: number }[]|null  = await this.daoClient.selectValues(
      table, { box_id }, ['person_id']
    );
    if (!currentList)
      return await this.insertPermissions(table, box_id, usernames);
    const currentIds: number[] = currentList.map(x => x.person_id);
    const newIds: number[] = await this.getUsersIds(usernames);
    const queries: string[] = [
      `delete from ${table} where box_id = $1 and person_id not in (${newIds});`,
    ];
    const insertIds: number[] = newIds.filter(id => !currentIds.includes(id));
    if (insertIds.length) {
      const insertValues: string[] = insertIds.map(id => `($1, ${id})`);
      queries.push(
        `insert into ${table} (box_id, person_id) values ${insertValues};`
      );
    }
    await Promise.all(
      queries.map((q: string): Promise<any> =>
        this.daoClient.rawQuery(q, [box_id])
      )
    );
  }

  public async getUserBoxIds(
    username: string,
    boxName: string
  ): Promise<[number, number]|null> {
    const foundRes: BoxData[] = await this.daoClient.selectJoinedValues(
      ['boxes', 'users'],
      ['owner_id', 'id'],
      {}, ['owner_id', 'a.id'],
      `a.name = '${boxName}' and b.name = '${username}'`
    );
    if (!foundRes.length) return null;
    const [{ owner_id, id }]: BoxData[] = foundRes;
    return [ owner_id, id ];
  }

  public async removeBox(id: number): Promise<void> {
    await this.daoClient.removeValue('boxes', { id });
  }

  public async checkBoxAccess(
    ownerName: string,
    viewerName: string|null,
    boxName: string
  ): Promise<[number, number]|null> {
    let editor: boolean = false;
    const ownPage: boolean = ownerName === viewerName;
    const follower: boolean = await this.checkFollower(ownerName, viewerName);
    const idsRes: BoxData[] = await this.daoClient.selectJoinedValues(
      ['boxes', 'users'],
      ['owner_id', 'id'],
      {}, ['owner_id', 'a.id', 'access_level'],
      `a.name = '${boxName}' and b.name = '${ownerName}'`
    );
    if (!idsRes.length) return null;
    const ownerId: number = idsRes[0].owner_id;
    const boxId: number = idsRes[0].id;
    if (viewerName) {
      const viewerId: number = await this.getUserId(viewerName);
      editor = await this.checkEditor(boxId, viewerId);
    }
    const res: [number, number] = [ownerId, boxId];
    if (ownPage || editor) return res;
    const privacy: string = idsRes[0].access_level;
    const permitted: boolean = 
      (privacy === 'public') ||
      (privacy === 'followers' && follower);
    if (permitted) return res;
    if (privacy === 'limited') {
      const viewerRes: BoxData[]|null = await this.daoClient.selectValues(
        'users', { name: viewerName }, ['id']
      );
      if (!viewerRes) return null;
      const viewerId: number = viewerRes[0].id;
      const args: [BoxData, string[]] =
        [ { box_id: boxId, person_id: viewerId }, ['box_id'] ];
      const getRes = (table: string): Promise<BoxData[]|null> => 
        this.daoClient.selectValues(table, ...args);
      const editorRes: BoxData[]|null = await getRes('box_editors');
      if (editorRes) return res;
      const limitedRes: BoxData[]|null = await getRes('limited_viewers');
      if (limitedRes) return res;
    }
    return null;    
  }
}
