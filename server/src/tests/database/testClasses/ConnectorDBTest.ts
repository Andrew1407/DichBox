import TestLogger from '../../TestLogger';
import ITesterDB from '../ITesterDB';
import UserDBConnector from '../../../database/UserClientDB/UserDBConnector';
import IUserClientDB from '../../../database/UserClientDB/IUserClientDB';
import BoxesDBConnector from '../../../database/BoxesClientDB/BoxesDBConnector';
import IBoxesClientDB from '../../../database/BoxesClientDB/IBoxesClientDB';
import Validator from '../../../validation/Validator';
import UserValidator from '../../../validation/UserValidator';
import BoxValidator from '../../../validation/BoxValidator';
import { testBox, testUser } from '../../testData/database';
import { UserData, BoxData, NotificationsData } from '../../../datatypes';
import IClientDB from '../../../database/IClientDB';
import ClientDB from '../../../database/ClientDB';

export default class ConnectorDBTest extends TestLogger implements ITesterDB {
  private readonly testBox: BoxData[];
  private readonly testUser: UserData[];
  private readonly userConnector: IUserClientDB;
  private readonly boxesConnector: IBoxesClientDB;

  constructor() {
    super();
    type testData = BoxData|UserData;
    const copyData = (data: testData[]): testData[] => {
      return data.slice(2, 6)
        .map((obj: testData): testData => ({ ...obj }));
    };
    this.testBox = copyData(testBox);
    this.testUser = copyData(testUser);
    const dao: IClientDB = ClientDB.getInstance();
    const boxValidator: Validator = new BoxValidator();
    const userValidator: Validator = new UserValidator();
    this.userConnector = new UserDBConnector(dao, userValidator);
    this.boxesConnector = new BoxesDBConnector(dao, boxValidator);
  }

  public async testInsert(): Promise<void> {
    for (const i in this.testUser) {
      const owner: UserData = this.testUser[i];
      const box: BoxData = this.testBox[i];
      const name: string = owner.name;
      const insertUserExp: UserData[] = [owner, null];
      const insertBoxExp: UserData[] = [box, null];
      for (const i in insertUserExp) {
        const userExp: UserData = insertUserExp[i];
        const boxExp: BoxData = insertBoxExp[i];
        const userRes: UserData|null = await this.userConnector
          .insertUser(owner);
        if (userRes) {
          owner.id = userRes.id;
          box.owner_id = userRes.id;
        }
        this.check(userRes, userExp);

        const boxRes: UserData|null = await this.boxesConnector
          .insertBox(name, box, null, null);
        if (boxRes)
          box.id = boxRes.id;
        this.check(boxRes, boxExp);
      }
    }

    const noteRes: NotificationsData[] = await this.userConnector
        .getNotifications(this.testUser[0].name);
    const expectedMsg: string[] = [
      'Welcome to "DichBox" world. You need to know nothing, just start creating boxes, editing your profile, searching other users etc. Good luck!'
    ];
      const resMsg: string[] = noteRes[0].msgEntries;
    this.check(resMsg, expectedMsg);

    const invalidRes: any[] = [];
    const invalidBox: BoxData = {
      description: 'description',
      name_color: '#ffffff'
    }
    const invalidBoxData: [string, BoxData, any, any][] = [
      ['', null, null, null],
      [this.testUser[0].name, null, null, null],
      ['', invalidBox, null, null]
    ];
    for (const arg of invalidBoxData)
      invalidRes.push(await this.boxesConnector
        .insertBox(...arg));
    invalidRes.push(await this.userConnector.insertUser(null));
    this.checkInvalidRes(invalidRes);
  }

  public async testSelect(): Promise<void> {
    for (const user of this.testUser) {
      const { name, email, passwd } = user;
      const signInExp: Record<'name'|'passwd'|'notifications', string> = { 
        name,
        passwd,
        notifications: "0"
      };
      const signInRes: UserData|null = await this.userConnector
        .signInUser(email, passwd);
      const checkPasswd: boolean = await this.userConnector
        .checkPasswd(name, passwd);
      this.check(signInRes, signInExp);
      this.check({ pass: checkPasswd }, { pass: true });
    }

    const invalidSignIn: [string, string][] = [
      ['', this.testUser[0].passwd],
      [this.testUser[1].email, ''],
      [this.testUser[0].email, 'wrong_passwd']
    ];
    const invalidPass: [string, string][] = [
      ['', this.testUser[0].passwd],
      [this.testUser[2].name, ''],
      [this.testUser[3].name, 'wrong_passwd']
    ];
    const expected: any[] = [{ pass: false }, null];
    for (const i in invalidPass) {
      const signInArg: [string, string] = invalidSignIn[i];
      const passArg: [string, string] = invalidPass[i];
      const signInRes: UserData|null = await this.userConnector
        .signInUser(...signInArg);
      const signIn = (signInRes !== null && signInRes.constructor === Object &&
        Object.keys(signInRes).length === 0) ? null : signInRes;
      const pass: boolean = await this.userConnector
        .checkPasswd(...passArg);
      [{ pass }, signIn].forEach(
        (res: any, i: number): void => this.check(res, expected[i])
      );
    }
  }

  public async testUpdate(): Promise<void> {
    for (const i in this.testBox) {
      const owner: UserData = this.testUser[i];
      const box: BoxData = this.testBox[i];
      const { owner_id, name } = box;
      const updatedUser: UserData = { id: owner_id };
      const updatedBox: BoxData = { owner_id };
      const ownerName: string = owner.name;
      [updatedUser.name, updatedBox.name] = [ownerName, name].map(
        (arg: string): string => 'new_' + arg
      );
      const allowedKeys: (BoxData|UserData)[] = [owner, box];
      const updateUserExp: UserData[] = [owner, null];
      const updateBoxExp: BoxData[] = [box, null];
      for (const i in updateBoxExp) {
        const userExp: UserData = updateUserExp[i];
        const boxExp: BoxData = updateBoxExp[i];
        let userRes: UserData|null = await this.userConnector
          .updateUser(owner_id, updatedUser);
        let boxRes: BoxData|null = await this.boxesConnector
          .updateBox(updatedUser.name, box.name, updatedBox);
        if (userRes && boxRes) {
          [owner.name, box.name] = [updatedUser.name, updatedBox.name];
          [userRes, boxRes] = [userRes, boxRes].map(
            (res: UserData|BoxData, i: number): any => 
              this.excludeFields(res, allowedKeys[i])
          );
        }
        this.check(userRes, userExp);
        this.check(boxRes, boxExp);
      }
    }

    const invalidRes: any[] = [];
    const invalidUserData: [number, UserData][] = [
      [0, this.testUser[0]],
      [this.testUser[1].id, null],
      [0, null]
    ];
    const invalidBoxData: [string, string, BoxData][] = [
      ['', this.testBox[0].name, null],
      [this.testUser[1].name, '', null],
      ['', '', null]
    ];
    for (const arg of invalidUserData)
      invalidRes.push(await this.userConnector
        .updateUser(...arg));
    for (const arg of invalidBoxData)
      invalidRes.push(await this.boxesConnector
        .updateBox(...arg));
    invalidRes.push(await this.userConnector.insertUser(null));
    this.checkInvalidRes(invalidRes);
  }

  public async testDelete(): Promise<void> {
    for (const user of this.testUser)
      await this.userConnector.removeUser(user.id);
  }

  public async run(): Promise<void> {
    const testName: string = 'Database connectors test';
    this.logAndCheck(testName);
  }

  private equals(
    result: any,
    expected: any
  ): Error|null {
    const expectedStr: string = JSON.stringify(expected);
    const resultStr: string = JSON.stringify(result);
    const errMsg: string = `FAILED. Incorrect result - expected: \n"${expectedStr}", \ngot: \n"${resultStr}"`;
    if (!result && !expected) return null;
    if (!result || !expected) return new Error(errMsg);
    for (const key in result) {
        const expVal = expected[key];
        const resVal = result[key];
        if (resVal !== expVal)
          return new Error(errMsg);
      }
    return null;
  }

  private checkInvalidRes(resArr: any[]): void {
    resArr.forEach((res: any): void => this.check(res, null));
  }

  private excludeFields(input: any, expected: any): any {
    const expectedKeys: string[] = Object.keys(expected);
    const inputKeys: string[] = Object.keys(input);
    const filteredKeys: string[] = inputKeys.filter(
      (key: string): boolean =>
        expectedKeys.includes(key) && key !== 'passwd' 
    );
    const res: any = {};
    for (const key of filteredKeys)
      res[key] = input[key];
    return res;
  }

  private check(
    result: any,
    expected: any
  ): void {
    const testErr = this.equals(result, expected);
    this.addTestResult(testErr);
  }
}
