import { QueryResult } from 'pg';
import ClientDichBoxDB from './ClientDichBoxDB';
import { boxData, privacyList } from '../datatypes';

export default class BoxesClientDichBoxDB extends ClientDichBoxDB {
  public async getBoxesList(
    userId: number,
    ownPage: boolean,
    follower: boolean = false
  ): Promise<boxData[]|null> {
    let boxesList: boxData[]|null;
    if (ownPage) {
      const [userBoxes, inveteeBoxes]: (boxData[]|null)[] =
        await Promise.all([
          this.getUserOwnBoxes(userId),
          this.getUserInveteeBoxes(userId)
        ]);
      boxesList = (userBoxes || inveteeBoxes) ? 
        [ ...userBoxes, ...inveteeBoxes ] : null;
    } else {
      boxesList = await this.getVisitorBoxes(userId, follower);
    }
    return boxesList;
  }

  private async getUserOwnBoxes(owner_id: number): Promise<boxData[]|null> {
    const args: [string, { owner_id: number }, string[]] = [
      'boxes',
      { owner_id },
      ['name', 'name_color', 'access_level']
    ];
    const userBoxes: boxData[]|null = await this.selectValues(...args);
    return userBoxes;
  }

  private async getVisitorBoxes(
    id: number,
    follower: boolean
  ): Promise<boxData[]|null> {
    const boxesAccess = follower ?
      '(access_level = \'public\' or access_level = \'followers\');' :
      'access_level = \'public\';';
    const res: QueryResult = await this.poolClient.query(
      'select name, name_color, access_level from boxes where owner_id = $1 and ' + boxesAccess,
      [id]
    );
    const visitorBoxes: boxData[]|null = res.rowCount ?
      res.rows : null;
    return visitorBoxes;
  }

  private async getUserInveteeBoxes(id: number): Promise<boxData[]|null> {
    const res: QueryResult = await this.poolClient.query(
      'select name, name_color, $1 as access_level from boxes b left join box_access ba on b.id = ba.box_id where ba.person_id = $2;',
      ['invetee', id]
    );
    const inveteeBoxes: boxData[]|null = res.rowCount ?
      res.rows : null;
    return inveteeBoxes
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

  public async removeBox(id: number): Promise<void> {
    await this.removeValue('boxes', { id });
  }

  public async updateBox(
    id: number,
    boxData: boxData
  ): Promise<void> {
    await this.updateValueById('boxes', id, boxData);
  }
}