import { QueryResult } from 'pg';
import ClientDichBoxDB from './ClientDichBoxDB';
import { boxData, access_level } from '../datatypes';

export default class BoxesClientDichBoxDB extends ClientDichBoxDB {
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
    owner_id: number,
    person_id: number
  ): Promise<boxData[]> {
    const output: string[] = [
      'c.name as owner_name',
      'a.name',
      'a.name_color',
      '\'invetee\' as access_level'
    ];
    const sharedBoxes: boxData[] = await this.selectDoubleJoiedValues(
      ['boxes', 'limited_viewers', 'users'],
      ['a.id = b.box_id', 'a.owner_id = c.id'],
      { owner_id, person_id },
      output
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
    const userBoxes: boxData[] = await this.selectJoiedValues(
      ['boxes', 'users'],
      ['owner_id', 'id'],
      { owner_id },
      returnColumns
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
    const visitorBoxes: boxData[] =  await this.selectJoiedValues(
      ['boxes', 'users'],
      ['owner_id', 'id'],
      { owner_id },
      returnColumns,
      `and (${selectCondition})`
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
    const inveteeBoxes: boxData[] = await this.selectDoubleJoiedValues(
      ['boxes', 'box_editors', 'users'],
      ['a.id = b.box_id', 'a.owner_id = c.id'],
      { person_id },
      returnColumns
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
  ): Promise<boxData|null> {
    const ownPage: boolean = person_id === owner_id;
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
    const getters: any = {
      public: async (): Promise<boxData|null> => {
        const box: boxData[] = await this.selectJoiedValues(
          ['boxes', 'users'],
          ['owner_id', 'id'],
          { owner_id },
          returnColumns,
          `and a.name = '${boxName}'`
        );
        return box.length ? box[0] : null;
      },
      private: async (): Promise<boxData|null> => {
        return ownPage ?
          await getters.public() : null;
      },
      followers: async (): Promise<boxData|null> => {
        return ownPage || follower ?
          await getters.public() : null;
      },
      limited: async (): Promise<boxData|null> => {
        if (ownPage)
          return await getters.public();
        const box: boxData[] = await this.selectDoubleJoiedValues(
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
    const boxType: string = typeRes[0].access_level;
    const box: boxData|null =  await this.boxInfoGetter(
      boxType, boxName, viewer_id, owner_id, follower
    );
    const boxId: number = typeRes[0].id;
    const editor: boolean = ownPage ? ownPage :
      await this.checkEditor(boxId, viewer_id);
    return box ?
      { ...box, ...typeRes[0], editor } : null;
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
    owner_id: number,
    name: string
  ): Promise<boxData|null> {
    const res: boxData[]|null =  await this.selectValues(
      'boxes',
      { owner_id, name },
      ['name']
    );
    return res ? res[0] : null;
  }

  public async updateBox(
    owner_id: number,
    boxName: string,
    boxData: boxData|null,
    access_level: access_level,
    limitedUsers: any[]|null
  ): Promise<boxData> {
    const [ currentData ]: any[] = await this.selectValues(
      'boxes', { owner_id, name: boxName }, ['id', 'access_level']
    );
    const updated: boxData = await this.updateValueById(
      'boxes',
      currentData.id,
      { ...boxData, access_level, last_edited: 'now()' },
      [ ...Object.keys(boxData ? boxData : {}), 'last_edited', 'access_level' ]
    );
    const isLimited = (x: string): boolean => x === 'limited';
    const [ limitedNew, limitedOld ]: boolean[] =
      [updated.access_level, currentData.access_level].map(isLimited);
    if (!limitedNew && !limitedOld)
      return { ...updated, id: currentData.id };
    return { ...updated, id: currentData.id };
  }
    
  public async removeBox(id: number): Promise<void> {
    await this.removeValue('boxes', { id });
  }
}