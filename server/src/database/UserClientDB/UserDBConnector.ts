import * as bcrypt from 'bcrypt';
import IUserClientDB from './IUserClientDB';
import IClientDB from '../IClientDB';
import UserValidator from '../../validation/UserValidator';
import UserClienDB from './UserClientDB';
import Validator from '../../validation/Validator';
import { NotificationsData, UserData } from '../../datatypes';

export default class UserDBConnector extends UserClienDB implements IUserClientDB {
  private validator: UserValidator;

  constructor(dao: IClientDB, validator: Validator) {
    super(dao);
    this.validator = validator;
  }

  private async hashPasswd(passwd: string): Promise<string> {
    const hashRounds: number = 10;
    const salt: string = await bcrypt.genSalt(hashRounds);
    const hash: string = await bcrypt.hash(passwd, salt);
    return hash;
  }

  private async checkTakenFields(
    name: string,
    email: string
  ): Promise<boolean> {
    const foundColumns: UserData[] = await this.daoClient.rawQuery(
      'select id from users where name = $1 or email = $2;',
      [name, email]
    );
    return !!foundColumns.length;
  }

  public async insertUser(userData: UserData|null): Promise<UserData|null> {
    if (!userData) return null;
    const correctData: boolean = this.validator.checkDataEdited(userData);
    if (!correctData) return null;
    const fieldsTaken: boolean =
      await this.checkTakenFields(userData.name, userData.email)
    if (fieldsTaken) return null;
    userData.passwd = await this.hashPasswd(userData.passwd);
    return await super.insertUser(userData);
  }

  public async updateUser(
    id: number,
    UserData: UserData
  ): Promise<UserData|null> {
    if (!UserData) return null;
    const correctData: boolean = this.validator.checkDataEdited(UserData);
    if (!correctData) return null;
    if (UserData.name || UserData.email) {
      const name: string = UserData.name || '';
      const email: string = UserData.email || '';
      const takenFields: boolean = await this.checkTakenFields(name, email);
      if (takenFields) return null;
    }
    if (UserData.passwd)
      UserData.passwd = await this.hashPasswd(UserData.passwd);
    return await super.updateUser(id, UserData);
  }

  public async signInUser(
    email: string,
    passwd: string
  ): Promise<UserData|null> {
    const res: UserData|null = await super.signInUser(email);
    if (!res) return null;
    const passwdCorrect: boolean = await bcrypt.compare(passwd, res.passwd);
    if (!passwdCorrect) return {};
    delete res.passwd;
    return res;
  }

  public async checkPasswd(
    name: string,
    passwd: string
  ): Promise<boolean> {
    const res: UserData|null = await this.getUserData({ name }, ['passwd']);
    return !res ? false : await bcrypt.compare(passwd, res.passwd);
  }

  private async getNotifiactionsExtended(nts: NotificationsData[]): Promise<NotificationsData[]> {
    const listMsg: RegExp = /^((viewer|editor)(Add|Rm))$/;
    const ntsMapper = async (n: NotificationsData): Promise<NotificationsData> => {
      const msgType: string = n.type;
      const msgEntries: string[] = [];
      if (listMsg.test(msgType)) {
        const [ params ]: NotificationsData[] = await this.daoClient.selectJoinedValues(
          ['boxes', 'users'],
          ['owner_id', 'id'],
          {},
          ['owner_id as param', 'a.name as box_name', 'a.name_color as box_color', 'b.name as user_name', 'b.name_color as user_color'],
          `a.id = ${n.param}`
        );
        let msgStr: string = 'has';
        msgStr += msgType.endsWith('Add') ?
          ' added you to the ' : ' removed you from the ';
        msgStr += msgType.startsWith('viewer') ? 'viewer' : 'editor';
        msgStr += 's\' list in';
        msgEntries.push('User', msgStr, 'box');
        return { ...n, ...params, msgEntries };
      } else if (msgType === 'boxAdd') {
        const [ params ]: NotificationsData[] = await this.daoClient.selectJoinedValues(
          ['boxes', 'users'],
          ['owner_id', 'id'],
          {},
          ['owner_id as param', 'a.name as box_name', 'a.name_color as box_color', 'b.name as user_name', 'b.name_color as user_color'],
          `a.id = ${n.param}`
        );
        msgEntries.push('User', 'has created a new box:');
        return { ...n, ...params, msgEntries };
      } else if (msgType === 'userRm') {
        msgEntries.push('The account you followed', 'has been removed');
        const [ user_name, user_color ]: string[] = n.extra_values;
        delete n.param;
        return { ...n, msgEntries, user_name, user_color };
      } else if (msgType === 'helloMsg') {
        const helloMsg = 'Welcome to "DichBox" world. You need to know nothing, just start creating boxes, editing your profile, searching other users etc. Good luck!';
        msgEntries.push(helloMsg);
        return { ...n, msgEntries }
      }
      return n;
    };
    return await Promise.all(nts.map(ntsMapper));
  }

  public async getNotifications(name: string): Promise<NotificationsData[]> {
    const nts: NotificationsData[] = await super.getNotifications(name);
    return !nts.length ? nts : await this.getNotifiactionsExtended(nts);
  }
}
