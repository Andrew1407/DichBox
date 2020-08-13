import { QueryResult } from 'pg';
import ClientDichBoxDB from './ClientDichBoxDB';
import { boxData, privacyList } from '../datatypes';

export default class BoxesClientDichBoxDB extends ClientDichBoxDB {
  public async getBoxesList(
    viewerId: number,
    boxOwnerId: number,
    follower: boolean
  ): Promise<boxData[]|null> {
    const ownPage: boolean = viewerId === boxOwnerId;
    const listGetters: Promise<boxData[]>[] = ownPage ?
      [
        this.getUserOwnBoxes(boxOwnerId),
        this.getUserInveteeBoxes(boxOwnerId)
      ] :
      [
        this.getVisitorBoxes(boxOwnerId, follower),
        this.getSharedBoxes(viewerId, boxOwnerId)
      ];
    const queries: boxData[][] = await Promise.all(listGetters);
    const boxesList: boxData[] = [...queries[0], ...queries[1]];
    return boxesList.length ? boxesList : null;
  }

  private async getSharedBoxes(
    owner_id: number,
    person_id: number
  ): Promise<boxData[]> {
    const selectColumns: any[] = [
      ['boxes', 'box_access', 'users'],
      ['a.id = b.box_id', 'a.owner_id = c.id'],
    ];
    const output: string[] = [
      'c.name as owner_name',
      'a.name as name',
      'a.name_color as name_color'
    ];
    const sharedBoxes: boxData[] = await this.selectDoubleJoiedValues(
      ['boxes', 'box_access', 'users'],
      ['a.id = b.box_id', 'a.owner_id = c.id'],
      { owner_id, person_id },
      [ ...output,
        `case when (owner_id = ${person_id}) then \'invetee\' else access_level end as access_level`
      ],
      `or (owner_id = ${person_id} and person_id = ${owner_id})`
    );
    return sharedBoxes;
  }

  private async getUserOwnBoxes(owner_id: number): Promise<boxData[]> {
    const returnColumns: string[] = 
      [
        'b.name as owner_name',
        'a.name as name',
        'a.name_color as name_color',
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
    const boxesAccess = follower ?
      'and (access_level = \'public\' or access_level = \'followers\')' :
      'and access_level = \'public\'';
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
      boxesAccess
    );
    return visitorBoxes;
  }

  private async getUserInveteeBoxes(id: number): Promise<boxData[]> {
    const returnColumns: string[] = [
      'c.name as owner_name',
      'a.name as name',
      'a.name_color as name_color',
      '\'invetee\' as access_level'
    ];
    const inveteeBoxes: boxData[] = await this.selectDoubleJoiedValues(
      ['boxes', 'box_access', 'users'],
      ['a.id = b.box_id', 'a.owner_id = c.id'],
      { person_id: id },
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
    viewer_id: number,
    owner_id: number,
    follower: boolean,
  ): Promise<boxData|null> {
    const ownPage: boolean = viewer_id === owner_id;
    const returnColumns: string[] = [
      'a.name as name',
      'a.name_color as name_color',
      'b.name as owner_name',
      'b.name_color as owner_nc',
      'a.reg_date as reg_date',
      'last_edited',
      'a.description as description',
      'a.description_color as description_color'
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
          ['boxes', 'users', 'box_access'],
          ['a.owner_id = b.id', 'a.id = c.box_id'],
          { owner_id, person_id: viewer_id },
          [ ...returnColumns, 'privilege' ],
        );
        return box.length ? box[0] : null;
      }
    };
    return await getters[actionType]();
  }

  public async getBoxInfo(
    boxName: string,
    viewer_id: number,
    owner_id: number,
    follower: boolean,
  ): Promise<boxData|null> {
    const typeRes: boxData[] = await this.selectValues(
      'boxes', { owner_id, name: boxName }, ['id', 'access_level']
    );
    if (!typeRes) return null;
    const boxType: string = typeRes[0].access_level;
    const box: boxData|null =  await this.boxInfoGetter(
      boxType, boxName, viewer_id, owner_id, follower
    );
    return box ?
      { ...box, id: typeRes[0].id } : null;
  }

  private async insertLimitedUsers(
    box_id: number,
    privacyList: privacyList
  ): Promise<void> {
    const usernames: string[] = privacyList
      .map(x => x.name);
    const usersIds: number[] = await this.getUsersIds(usernames);
    const insertList: string[] = [];
    for (let i = 0; i < usernames.length; i++)
      insertList.push(
        `(${box_id}, ${usersIds[i]}, '${privacyList[i].access_level}')`
      );
    await this.poolClient.query(
      `insert into box_access (box_id, person_id, privilege) values ${insertList.join(', ')};`
    );
  }

  public async insertBox(
    boxData: boxData,
    privacyList: null|privacyList
  ): Promise<boxData|null> {
    const insertedBox: boxData = 
      await this.insertValue('boxes', boxData, ['name', 'id']);
    if (privacyList)
      await this.insertLimitedUsers(insertedBox.id, privacyList);
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
    id: number,
    boxData: boxData
  ): Promise<void> {
    await this.updateValueById('boxes', id, boxData);
  }
    
  public async removeBox(id: number): Promise<void> {
    await this.removeValue('boxes', { id });
  }
}