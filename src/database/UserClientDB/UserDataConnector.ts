import * as bcrypt from 'bcrypt';
import UserClientDichBoxDB from './UserClientDichBoxDB';
import UserValidator from '../../validation/UserValidator';
import { userData } from '../../datatypes';
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

  public async insertUser(userData: userData|null): Promise<userData|null> {
    if (!userData) return null;
    const correctData: boolean = this.validator.checkDataEdited(userData);
    if (!correctData) return null;
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
    if (!passwdCorrect) return null;
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

  public async hash(): Promise<void> {
    const res: QueryResult = await this.poolClient.query(
      'select id, passwd from users;'
    );
    await Promise.all(res.rows.map(async ({ id, passwd }) => {
      const hashRounds: number = 10;
      const salt: string = await bcrypt.genSalt(hashRounds);
      const hash: string = await bcrypt.hash(passwd, salt);
      await this.poolClient.query(
        'update users set passwd = $1 where id = $2;',
        [hash, id]
      );
      return null;
    })) 
  }
}
