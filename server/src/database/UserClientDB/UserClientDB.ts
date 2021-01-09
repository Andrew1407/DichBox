import IUserClientDB from './IUserClientDB';
import IClientDB from '../IClientDB';
import { UserData, SubscribersData, NotificationsData } from '../../datatypes';

export default class UserClienDB implements IUserClientDB {
  protected daoClient: IClientDB;

  constructor(dao: IClientDB) {
    this.daoClient = dao;
  }

  public connect() {
    this.daoClient.clientConnect();
  }

  public async getUserId(name: string): Promise<number|null> {
    return await this.daoClient.getUserId(name);
  }

  private async getNotificationsAmount(id: number): Promise<number> {
    const res: UserData[] = await this.daoClient.rawQuery(
      'select count(*) as notifications from notifications where person_id = $1;',
      [id]
    );
    return res[0].notifications;
  }

  private async getUsersAccessList(
    table: string,
    box_id: number
  ): Promise<UserData[]> {
    return await this.daoClient.selectJoinedValues(
      [table, 'users'],
      ['person_id', 'id'],
      { box_id },
      ['name', 'name_color', 'id']
    );
  }

  public async insertUser(userData: UserData): Promise<UserData> {
    return await this.daoClient
      .insertValue('users', userData, ['name', 'id']);
  }

  public async updateUser(
    id: number,
    userData: UserData
  ): Promise<UserData|null> {
    return await this.daoClient
      .updateValueById('users', id, userData)
  }

  public async getUsersData(
    values: UserData,
    returning: string[] = ['*']
  ): Promise<UserData[]|null> {
    return await this.daoClient.
      selectValues('users', values, returning);
  }

  public async getUserData(
    values: UserData,
    returning: string[] = ['*']
  ): Promise<UserData|null> {
    const userRes: UserData[]|null = await this.daoClient
      .selectValues('users', values, returning);
    if (!userRes) return null;
    const notifications: number = await this.getNotificationsAmount(userRes[0].id);
    return { ...userRes[0], notifications };
  }

  public async removeUser(id: number): Promise<void> {
    await this.daoClient.removeValue('users', { id });
  }

  // subscribers

  public async getUserSubsciptions(name: string): Promise<UserData[]|null> {
    const person_id: number|null = await this.daoClient.getUserId(name);
    if (!person_id)
      return null;
    const subs: UserData[]|null = await this.daoClient.selectJoinedValues(
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
      [personName, subscriptionName].map(
        (x: string): Promise<number> => this.daoClient.getUserId(x)
      )
    );
    if (!(person_id && subscription))
      return null;
    const getQueries = (): Promise<unknown>[] => {
      const args: ['subscribers', SubscribersData] = [
        'subscribers',
        { person_id, subscription }
      ];
      const [ subsMethod, followersSign ]: [string, string] =
        action === 'subscribe' ?
          ['insertValue', '+'] :
          ['removeValue', '-'];
      return [
        this.daoClient.rawQuery(
          `update users set followers = (followers ${followersSign} 1) where id = $1 returning followers;`,
          [subscription]
        ),
        this.daoClient[subsMethod](...args)
      ];
    };
    
    const [ followersRes ]: any[] = await Promise.all(getQueries());
    const followers: number = followersRes[0].followers;
    return followers;
  }

  public async checkSubscription(
    person_id: number,
    subscription: number
  ): Promise<boolean> {
    const queryRes: ({ subscription: number }|null)[] = await this.daoClient.selectValues(
      'subscribers',
      { person_id, subscription },
      ['person_id']
    );
    return !!queryRes;
  }

  public async getUsernames(
    usersTemplate: string,
    username: string
  ): Promise<UserData[]|null> {
    const res: UserData[] = await this.daoClient.rawQuery(
      `select id, name, name_color from users where name like \'%${usersTemplate}%\' and name != $1 limit 10;`,
      [username]
    );
    return res.length ? res: null;
  }

  public async getLimitedUsers(
    username: string,
    boxName: string
  ): Promise<UserData[][]> {
    const [{ id }]: { id: number }[] = await this.daoClient.selectJoinedValues(
      ['boxes', 'users'],
      ['owner_id', 'id'],
      {}, ['a.id'],
      `a.name = '${boxName}' and b.name = '${username}'`
    );
    const tables: [string, string] =
      ['limited_viewers', 'box_editors'];
    const usersList: UserData[][] = await Promise.all(
      tables.map(x => this.getUsersAccessList(x, id))
    );
    return usersList;
  }

  public async searchUsers(nameTemplate: string): Promise<UserData[]> {
    const foundRes: UserData[] = await this.daoClient.rawQuery(
      `select id, name, name_color from users where name like \'%${nameTemplate}%\' order by followers desc;`
    );
    return foundRes;
  }

  public async getNotifications(name: string): Promise<NotificationsData[]> {
    return await this.daoClient.selectJoinedValues(
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
    const userId: number|null = await this.daoClient.getUserId(name);
    if (!(userId && ids.length))
      return false;
    const queryStr: string = ids.length > 1 ?
      `delete from notifications where person_id = $1 and id in (${ids});` :
      `delete from notifications where person_id = $1 and id = ${ids[0]};`;
    await this.daoClient.rawQuery(queryStr, [userId]);
    return true;
  }

  public async checkColumn(
    column: string,
    value: string
  ): Promise<string|null> {
    const valObj: UserData = { [column]: value };
    const res: UserData|null = await this.getUserData(valObj, [column]);
    return res ? res[column] : null;
  }

  public async signInUser(email: string, _: string = ''): Promise<UserData|null> {
    return await this.getUserData({ email }, ['name', 'passwd']);
  }

  public async checkPasswd(
    name: string,
    _: string
  ): Promise<boolean> {
    const res: UserData|null = await this.getUserData({ name }, ['passwd']);
    return !!res;
  }

}
