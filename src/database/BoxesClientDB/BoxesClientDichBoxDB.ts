import { QueryResult } from 'pg';
import ClientDichBoxDB from '../ClientDichBoxDB';
import { boxData } from '../../datatypes';

export default abstract class BoxesClientDichBoxDB extends ClientDichBoxDB {
  public async getBoxesList(
    viewerName: string,
    boxOwnerName: string,
    follower: boolean
  ): Promise<boxData[]|null> {
    const ownPage: boolean = viewerName === boxOwnerName;
    const viewerId: number = await this.getUserId(viewerName);
    const boxOwnerId: number = ownPage ? viewerId :
      await this.getUserId(boxOwnerName);
    const getters: Promise<boxData[]>[] = ownPage ?
      [
        this.getUserOwnBoxes(boxOwnerId),
        this.getUserInveteeBoxes(boxOwnerId)
      ] :
      [
        this.getVisitorBoxes(boxOwnerId, follower),
        this.getLimitedBoxes(viewerId, boxOwnerId)
      ];
    const queries: boxData[][] = await Promise.all(getters);
    const boxesList: boxData[] = [...queries[0], ...queries[1]];
    return boxesList.length ? boxesList : null;
  }

  private async getLimitedBoxes(
    person_id: number,
    owner_id: number
  ): Promise<boxData[]> {
    const output: string[] = [
      'c.name as owner_name',
      'b.name',
      'b.name_color',
      'access_level'
    ];
    const sharedBoxes: boxData[] = await this.selectDoubleJoinedValues(
      ['limited_viewers', 'boxes', 'users'],
      ['b.id = a.box_id', 'b.owner_id = c.id'],
      { owner_id, person_id },
      output,
      'order by last_edited desc'
    );
    return sharedBoxes;
  }

  private async getUserOwnBoxes(owner_id: number): Promise<boxData[]> {
    const returnColumns: string[] = 
      [
        'b.name as owner_name',
        'a.name',
        'a.name_color',
        'access_level'
      ];
    const userBoxes: boxData[] = await this.selectJoinedValues(
      ['boxes', 'users'],
      ['owner_id', 'id'],
      { owner_id },
      returnColumns,
      'order by last_edited desc'
    );
    return userBoxes;
  }

  private async getVisitorBoxes(
    owner_id: number,
    follower: boolean
  ): Promise<boxData[]> {
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
    const visitorBoxes: boxData[] =  await this.selectJoinedValues(
      ['boxes', 'users'],
      ['owner_id', 'id'],
      { owner_id },
      returnColumns,
      `and (${selectCondition}) order by last_edited desc`
    );
    return visitorBoxes;
  }

  private async getUserInveteeBoxes(person_id: number): Promise<boxData[]> {
    const returnColumns: string[] = [
      'c.name as owner_name',
      'a.name',
      'a.name_color',
      '\'invetee\' as access_level'
    ];
    const inveteeBoxes: boxData[] = await this.selectDoubleJoinedValues(
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
      .map(x => `'${x}'`)
      .join(', ');
    const res: QueryResult = await this.poolClient.query(
      `select id from users where name in (${namesList});`
    );
    const ids: number[] = res.rows
      .map(x => x.id);
    return ids;
  }

  private async boxInfoGetter(
    actionType: string,
    boxName: string,
    person_id: number,
    owner_id: number,
    follower: boolean,
    editor: boolean
  ): Promise<boxData|null> {
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
      public: () => Promise<boxData|null>,
      private: () => Promise<boxData|null>,
      followers: () => Promise<boxData|null>,
      limited: () => Promise<boxData|null>,
    };
    const getters: gettersFns = {
      public: async (): Promise<boxData|null> => {
        const box: boxData[] = await this.selectJoinedValues(
          ['boxes', 'users'],
          ['owner_id', 'id'],
          { owner_id },
          returnColumns,
          `and a.name = '${boxName}'`
        );
        return box.length ? box[0] : null;
      },
      private: async (): Promise<boxData|null> => {
        return viewPermitted ?
          await getters.public() : null;
      },
      followers: async (): Promise<boxData|null> => {
        return viewPermitted || follower ?
          await getters.public() : null;
      },
      limited: async (): Promise<boxData|null> => {
        if (viewPermitted)
          return await getters.public();
        const box: boxData[] = await this.selectDoubleJoinedValues(
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
    viewerName: string,
    ownerName: string,
    follower: boolean,
  ): Promise<boxData|null> {
    const ownPage: boolean = viewerName === ownerName;
    const owner_id: number = await this.getUserId(ownerName);
    const viewer_id: number = ownPage ? owner_id :
      await this.getUserId(viewerName);
    const typeRes: boxData[]|null = await this.selectValues(
      'boxes', { owner_id, name: boxName }, ['id', 'access_level']
    );
    if (!typeRes)
      return null;
    const boxId: number = typeRes[0].id;
    const editor: boolean = ownPage ? ownPage :
      await this.checkEditor(boxId, viewer_id);
    const boxType: string = typeRes[0].access_level;
    const box: boxData|null =  await this.boxInfoGetter(
      boxType, boxName, viewer_id, owner_id, follower, editor
    );
    return box ? { ...box, ...typeRes[0], editor, owner_id } : null;  
  }

  private async checkEditor(
    box_id: number,
    person_id: number
  ): Promise<boolean> {
    const foundValue: { box_id: number }[]|null = await this.selectValues(
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
    await this.poolClient.query(
      `insert into ${table} (box_id, person_id) values ${values};`,
      [box_id]
    );
  }

  public async insertBox(
    ownerName: string,
    boxData: boxData,
    limitedUsers: string[]|null,
    editors: string[]|null
  ): Promise<boxData|null> {
    const owner_id: number = await this.getUserId(ownerName);
    const insertedBox: boxData =
      await this.insertValue(
        'boxes',
        { ...boxData, owner_id },
        ['name', 'id', 'owner_id']
      );
    if (limitedUsers)
      await this.insertPermissions('limited_viewers', insertedBox.id, limitedUsers);
    if (editors)
      await this.insertPermissions('box_editors', insertedBox.id, editors)
    return insertedBox;
  }

  public async findUserBox(
    username: number,
    boxName: string
  ): Promise<boxData|null> {
    const res: boxData[]|null =  await this.selectJoinedValues(
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
    boxData: boxData,
    limitedlist: string[]|null = null,
    editorslist: string[]|null = null
  ): Promise<boxData|null> {
    const beforeUpdateRes: boxData[] = await this.selectJoinedValues(
      ['boxes', 'users'],
      ['owner_id', 'id'],
      {}, ['a.id', 'access_level'],
      `a.name = '${boxName}' and b.name = '${ownerName}'`
    );
    if (!beforeUpdateRes.length)
      return null;
    const beforeUpdate: boxData = beforeUpdateRes[0];
    const returnColumns: string[] = ['last_edited', 'owner_id'];
    if (boxData)
      returnColumns.push(...Object.keys(boxData));
    if (!returnColumns.includes('access_level'))
      returnColumns.push('access_level');
    const updated: boxData = await this.updateValueById(
      'boxes',
      beforeUpdate.id,
      { ...boxData, last_edited: 'now()' },
      returnColumns
    );
    if (editorslist)
      await this.updateAccessList('box_editors', beforeUpdate.id, editorslist);
    else
      await this.removeValue('box_editors', { box_id: beforeUpdate.id });
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
    if (wasLimited || !limitedlist)
      await this.removeValue('limited_viewers', { box_id: beforeUpdate.id });
    else if (setLimited)
      await this.insertPermissions('limited_viewers', beforeUpdate.id, limitedlist);
    else if (remainedLimited)
      await this.updateAccessList('limited_viewers', beforeUpdate.id, limitedlist);
    return { ...updated, id: beforeUpdate.id };
  }
    
  private async updateAccessList(
    table: string,
    box_id: number,
    usernames: string[]
  ): Promise<void> {
    const currentList: { person_id: number }[]|null  = await this.selectValues(
      table, { box_id }, ['person_id']
    );
    if (!currentList) {
      await this.insertPermissions(table, box_id, usernames);
      return;
    }
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
      queries.map(q => this.poolClient.query(q, [box_id]))
    );
  }

  public async getUserBoxIds(
    username: string,
    boxName: string
  ): Promise<[number, number]|null> {
    const foundRes: boxData[] = await this.selectJoinedValues(
      ['boxes', 'users'],
      ['owner_id', 'id'],
      {}, ['owner_id', 'a.id'],
      `a.name = '${boxName}' and b.name = '${username}'`
    );
    if (!foundRes.length)
      return null;
    const [{ owner_id, id }]: boxData[] = foundRes;
    return [ owner_id, id ];
  }

  public async removeBox(id: number): Promise<void> {
    await this.removeValue('boxes', { id });
  }

  public async checkBoxAccess(
    ownerName: string,
    viewerName: string,
    boxName: string,
    follower: boolean,
    editor: boolean = false
  ): Promise<[number, number]|null> {
    const ownPage: boolean = ownerName === viewerName;
    const idsRes: boxData[] = await this.selectJoinedValues(
      ['boxes', 'users'],
      ['owner_id', 'id'],
      {}, ['owner_id', 'a.id', 'access_level'],
      `a.name = '${boxName}' and b.name = '${ownerName}'`
    );
    if (!idsRes.length)
      return null;
    const ownerId: number = idsRes[0].owner_id;
    const boxId: number = idsRes[0].id;
    const res: [number, number] = [ownerId, boxId];
    if (ownPage || editor)
      return res;
    const privacy: string = idsRes[0].access_level;
    const permitted: boolean = 
      (privacy === 'public') ||
      (privacy === 'private' && ownPage) ||
      (privacy === 'followers' && follower);
    if (permitted) 
      return res;
    if (privacy === 'limited') {
      const viewerRes: boxData[]|null = await this.selectValues(
        'users', { name: viewerName }, ['id']
      );
      if (!viewerRes) return null;
      const viewerId: number = viewerRes[0].id;
      const args: [boxData, string[]] =
        [ { box_id: boxId, person_id: viewerId }, ['box_id'] ];
      const getRes = (table: string): Promise<boxData[]|null> => 
        this.selectValues(table, ...args);
      const editorRes: boxData[]|null = await getRes('box_editors');
      if (editorRes) return res;
      const limitedRes: boxData[]|null = await getRes('limited_viewers');
      if (limitedRes) return res;
    }
    return null;    
  }
}