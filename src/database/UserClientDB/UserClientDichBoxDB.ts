import { QueryResult } from 'pg';
import ClientDichBoxDB from '../ClientDichBoxDB';
import { userData, subscribersData, notificationsData } from '../../datatypes';

export default abstract class UserClientDichBoxDB extends ClientDichBoxDB {
  private async getNotificationsAmount(id: number): Promise<number> {
    const res: QueryResult = await this.poolClient.query(
      'select count(*) as notifications from notifications where person_id = $1;',
      [id]
    );
    return res.rows[0].notifications;
  }

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
    const userRes: userData[]|null = await this.selectValues('users', values, returning);
    if (!userRes) return null;
    const notifications: number = await this.getNotificationsAmount(userRes[0].id);
    return { ...userRes[0], notifications };
  }

  public async removeUser(id: number): Promise<void> {
    this.removeValue('users', { id });
  }

  // subscribers

  public async getUserSubsciptions(name: string): Promise<userData[]|null> {
    const person_id: number|null = await this.getUserId(name);
    if (!person_id)
      return null;
    const subs: userData[]|null = await this.selectJoinedValues(
      ['subscribers', 'users'],
      ['subscription', 'id'],
      { person_id },
      ['id', 'name', 'name_color']
    );
    subs.reverse();
    return subs;
  }

  public async subscibe(
    personName: string,
    subscriptionName: string,
    action: 'subscribe'|'unsubscribe'
  ): Promise<number|null> {
    const [ person_id, subscription ]: (number|null)[] = await Promise.all(
      [personName, subscriptionName].map(x => this.getUserId(x))
    );
    if (!person_id || !subscription)
      return null;
    const getQueries = (): Promise<any>[] => {
      const args: ['subscribers', subscribersData] = [
        'subscribers',
        { person_id, subscription }
      ];
      const [ subsMethod, followersSign ]: [string, string] =
        action === 'subscribe' ?
          ['insertValue', '+'] :
          ['removeValue', '-'];
      return [
        this.poolClient.query(
          `update users set followers = (followers ${followersSign} 1) where id = $1 returning followers;`,
          [subscription]
        ),
        this[subsMethod](...args)
      ];
    };
    
    const [ followersRes ]: any[] = await Promise.all(getQueries());
    const followers: number = followersRes.rows[0].followers;
    return followers;
  }

  public async checkSubscription(
    person_id: number,
    subscription: number
  ): Promise<boolean> {
    const queryRes: ({ subscription: number }|null)[] = await this.selectValues(
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
    const [{ id }]: { id: number }[] = await this.selectJoinedValues(
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
    return await this.selectJoinedValues(
      [table, 'users'],
      ['person_id', 'id'],
      { box_id },
      ['name', 'name_color', 'id']
    );
  }

  public async searchUsers(nameTemplate: string): Promise<userData[]> {
    const foundRes: QueryResult = await this.poolClient.query(
      `select id, name, name_color from users where name like \'%${nameTemplate}%\' order by followers desc;`
    );
    return foundRes.rows;
  }

  public async getNotifications(name: string): Promise<notificationsData[]> {
    return await this.selectJoinedValues(
      ['notifications', 'users'],
      ['person_id', 'id'],
      { name },
      ['a.id', 'note_date', 'type', 'param', 'extra_values']
    );
  }

  public async removeNotifications(
    name: string,
    ids: number[]
  ): Promise<boolean> {
    const userId: number|null = await this.getUserId(name);
    if (!(userId && ids.length))
      return false;
    const queryStr: string = ids.length > 1 ?
      `delete from notifications where person_id = $1 and id in (${ids});` :
      `delete from notifications where person_id = $1 and id = ${ids[0]};`;
    await this.poolClient.query(
      queryStr,
      [userId]
    );
    return true;
  }
}
