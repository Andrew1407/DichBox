import { QueryResult } from 'pg';
import ClientDichBoxDB from './ClientDichBoxDB';
import { userData } from '../datatypes';

export default class UserClientDichBoxDB extends ClientDichBoxDB {
  public async insertUser(userData: userData): Promise<userData> {
    return await this.insertValue('users', userData, ['name', 'id']);
  }

  public async updateUser(
    id: number,
    userData: userData
  ): Promise<userData|null> {
    return await this.updateValueById('users', id, userData);
  }

  public async getUsersData(
    values: userData,
    returning: string[] = ['*']
  ): Promise<userData[]|null> {
    return await this.selectValues('users', values, returning);
  }

  public async getUserData(
    values: userData,
    returning: string[] = ['*']
  ): Promise<userData|null> {
    const res = await this.selectValues('users', values, returning);
    return res ? res[0] : null;
  }

  public async removeUser(id: number): Promise<void> {
    const queries: string[] = [
      'delete from users where id = $1;',
      // `update users set subscriptions = array_remove(subscriptions, $1) where \'{${id}}\' <@ subscriptions;`,
      // 'update users set followers = (followers - 1) where \'{$1}\' <@ distributors_arr;',
    ];
    queries.forEach(async query =>
      await this.poolClient.query(query, [id])
    );
  }

  // subscribers

  public async getUserSubsciptions(id: number): Promise<number[]> {
    const queryArgs: [string, userData, [string]] =
      ['subscribers', { id }, ['subscription']];
    const queryRes: { subscription: number }[] =
      await this.selectValues(...queryArgs);
    const subscriptions: number[] = queryRes ?
      queryRes.map(x => x.subscription): null;
    return subscriptions;
  }

  public async addSubsciber(
    person_id: number,
    subscription: number
  ): Promise<void> {
    await this.insertValue('subscribers', { person_id, subscription });
  }

  public async removeSubscriber(
    person_id: number,
    subscription: number
  ): Promise<void> {
    await this.removeValue('subscribers', { person_id, subscription });
  }

  public async checkSubscription(
    person_id: number,
    subscription: number
  ): Promise<boolean> {
    const queryRes: { subscription: number }[] = await this.selectValues(
      'subscribers',
      { person_id, subscription },
      ['person_id']
    );
    return !!queryRes;
  }

  public async getUsernames(
    usersTemplate: string,
    username: string
  ): Promise<userData[]|null> {
    const res: QueryResult = await this.poolClient.query(
      `select id, name, name_color from users where name like \'%${usersTemplate}%\' and name != $1 limit 10;`,
      [username]
    );
    const names: userData[]|null = res.rowCount ?
      res.rows : null;
    return names;
  }

  public async getLimitedUsers(
    username: string,
    boxName: string
  ): Promise<userData[][]> {
    const [{ id }]: { id: number }[] = await this.selectJoiedValues(
      ['boxes', 'users'],
      ['owner_id', 'id'],
      {}, ['a.id'],
      `a.name = '${boxName}' and b.name = '${username}'`
    );
    const tables: [string, string] =
      ['limited_viewers', 'box_editors'];
    const usersList: userData[][] = await Promise.all(
      tables.map(x => this.getUsersAccessList(x, id))
    );
    return usersList;
  }

  private async getUsersAccessList(
    table: string,
    box_id: number
  ): Promise<userData[]> {
    return await this.selectJoiedValues(
      [table, 'users'],
      ['person_id', 'id'],
      { box_id },
      ['name', 'name_color', 'id']
    );
  }
}
