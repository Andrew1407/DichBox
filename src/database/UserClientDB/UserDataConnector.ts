import * as bcrypt from 'bcrypt';
import UserClientDichBoxDB from './UserClientDichBoxDB';
import UserValidator from '../../validation/UserValidator';
import { notificationsData, userData } from '../../datatypes';
import { QueryResult } from 'pg';

export default class UserBaseConnector extends UserClientDichBoxDB {
  private validator: UserValidator;

  constructor() {
    super();
    this.validator = new UserValidator();
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
    const foundColumns: QueryResult = await this.poolClient.query(
      'select id from users where name = $1 or email = $2;',
      [name, email]
    );
    return !!foundColumns.rowCount;
  }

  public async insertUser(userData: userData|null): Promise<userData|null> {
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
    userData: userData
  ): Promise<userData|null> {
    if (!userData) return null;
    const correctData: boolean = this.validator.checkDataEdited(userData);
    if (!correctData) return null;
    if (userData.name || userData.email) {
      const name: string = userData.name || '';
      const email: string = userData.email || '';
      const takenFields: boolean = await this.checkTakenFields(name, email);
      if (takenFields) return null;
    }
    if (userData.passwd)
      userData.passwd = await this.hashPasswd(userData.passwd);
    return await super.updateUser(id, userData);
  }

  public async signInUser(
    email: string,
    passwd: string
  ): Promise<userData|null> {
    const res: userData|null = await this.getUserData({ email }, ['name', 'passwd']);
    if (!res) return null;
    const passwdCorrect: boolean = await bcrypt.compare(passwd, res.passwd);
    if (!passwdCorrect) return {};
    delete res.passwd;
    return res;
  }

  public async checkColumn(
    column: string,
    value: string
  ): Promise<string|null> {
    const valObj: userData = { [column]: value };
    const res: userData|null = await this.getUserData(valObj, [column])
    return res ? res[column] : null;
  }

  public async checkPasswd(
    name: string,
    passwd: string
  ): Promise<boolean> {
    const res: userData|null = await this.getUserData({ name }, ['passwd']);
    return !res ? false : await bcrypt.compare(passwd, res.passwd);
  }

  private async getNotifiactionsExtended(nts: notificationsData[]): Promise<notificationsData[]> {
    const listMsg: RegExp = /^((viewer|editor)(Add|Rm))$/;
    const ntsMapper = async (n: notificationsData): Promise<notificationsData> => {
      const msgType: string = n.type;
      const msgEntries: string[] = [];
      if (listMsg.test(msgType)) {
        const [ params ]: notificationsData[] = await this.selectJoinedValues(
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
        const [ params ]: notificationsData[] = await this.selectJoinedValues(
          ['boxes', 'users'],
          ['owner_id', 'id'],
          {},
          ['owner_id as param', 'a.name as box_name', 'a.name_color as box_color', 'b.name as user_name', 'b.name_color as user_color'],
          `a.id = ${n.param}`
        );
        msgEntries.push('User', 'has created a new box:');
        return { ...n, ...params, msgEntries };
      } else if (msgType === 'userRm') {
        msgEntries.push('Account you followed', 'has been removed');
        const [ user_name, user_color ]: string[] = n.extra_values;
        delete n.param;
        return { ...n, msgEntries, user_name, user_color };
      }
      return n;
    };
    return await Promise.all(nts.map(ntsMapper));
  }

  public async getNotifications(name: string): Promise<notificationsData[]> {
    const nts: notificationsData[] = await super.getNotifications(name);
    return !nts.length ? nts : await this.getNotifiactionsExtended(nts);
  }
}
