import TestLogger from '../../TestLogger';
import ITesterDB from '../ITesterDB';
import UserClientDB from '../../../database/UserClientDB/UserClientDB';
import IUserClientDB from '../../../database/UserClientDB/IUserClientDB';
import BoxesClientDB from '../../../database/BoxesClientDB/BoxesClientDB';
import IBoxesClientDB from '../../../database/BoxesClientDB/IBoxesClientDB';
import { testBox, testUser } from '../../testData/database';
import { UserData, BoxData, NotificationsData } from '../../../datatypes';
import IClientDB from '../../../database/IClientDB';
import ClientDB from '../../../database/ClientDB';

export default class ClientDBTest extends TestLogger implements ITesterDB {
  private readonly testBox: BoxData[];
  private readonly testUser: UserData[];
  private readonly userClient: IUserClientDB;
  private readonly boxesClient: IBoxesClientDB;
  
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
    this.userClient = new UserClientDB(dao);
    this.boxesClient = new BoxesClientDB(dao);
  }

  public async testInsert(): Promise<void> {
    for (const i in this.testUser) {
      const userData: UserData = this.testUser[i];
      const boxData: BoxData = this.testBox[i];
      const insertUser: UserData = await this.userClient.insertUser(userData);
      const { id, name, user_uid } = insertUser;
      userData.id = id;
      userData.user_uid = user_uid;
      const insertBox: BoxData = await this.boxesClient.insertBox(
        userData.name,
        boxData,
        null,
        null
      );
      boxData.owner_id = id;
      boxData.id = insertBox.id;
      boxData.owner_name = name;
      this.check(insertBox, boxData);
      this.check(insertUser, userData);
    }
  }

  public async testSelect(): Promise<void> {
    await this.testUserSelect();
    await this.testBoxSelect();
  }

  public async testUpdate(): Promise<void> {
    const [curUserValue, updatedUserValue]: UserData[] = this.testUser;
    const [curBoxValue, updatedBoxValue]: BoxData[] = this.testBox;
    const newUserDescription: UserData = {
      description: updatedUserValue.description
    };
    const newBoxDescription: BoxData = {
      description: updatedBoxValue.description
    };
    const updateUserData: [number, UserData][] = [
      [curUserValue.id, newUserDescription],
      [0, updatedUserValue]
    ];
    const updateUserExp: UserData[] = [newUserDescription, null];
    const updateBoxData: [string, string, BoxData][] = [
      [curUserValue.name, curBoxValue.name, newBoxDescription],
      [curUserValue.name, updatedBoxValue.name, newBoxDescription]
    ];
    const updateBoxExp: BoxData[] = [newBoxDescription, null];
    for (const i in updateUserData) {
      const userId: number = updateUserData[i][0];
      const updatable: UserData = { ...updateUserData[i][1] };
      delete updatable.user_uid;
      let updateUserRes: UserData|null = await this.userClient
        .updateUser(userId, updatable);
      let updateBoxRes: BoxData|null = await this.boxesClient
        .updateBox(...updateBoxData[i]);
      if (updateUserRes && updateBoxRes) 
        [updateUserRes, updateBoxRes] = [updateUserRes, updateBoxRes]
          .map((res: BoxData|UserData): { description: string } => {
            const description: string = res.description;
            return { description };
        }
      );
      this.check(updateUserRes, updateUserExp[i]);
      this.check(updateBoxRes, updateBoxExp[i]);
    }
    curUserValue.description = updatedUserValue.description;
    curBoxValue.description = updatedBoxValue.description;
    await this.testSubscribe('subscribe');
  }

  public async testDelete(): Promise<void> {
    await this.testSubscribe('unsubscribe');
    for (const i in this.testUser) {
      const userData: UserData = { ...this.testUser[i] };
      const { user_uid, name } = userData;
      delete userData.user_uid;
      const boxData: BoxData = this.testBox[i];
      const boxID: number = boxData.id;
      const notifications: NotificationsData[] = await this.userClient
        .getNotifications(name);
      const ids: number[] = notifications.map(
        (note: NotificationsData): number => note.id
      );
      const noteRemoveRes: boolean = await this.userClient
        .removeNotifications(name, ids);
      const resObj: { res: boolean } = { res: noteRemoveRes };
      this.check(resObj, { res: true });

      await this.boxesClient.removeBox(boxID);
      await this.userClient.removeUser(user_uid);
      const getResUser: UserData|null = await this.userClient
        .getUserData(userData);
      const getResBox: BoxData|null = await this.boxesClient
        .getBoxInfo(boxData.name, userData.name, userData.name);
      [getResBox, getResUser].forEach(
        (res: BoxData|UserData): void => this.check(res, null)
      );
    }
    const noteInvalid: boolean = await this.userClient
      .removeNotifications(this.testUser[0].name, []);
    this.check({ res: noteInvalid }, { res: false });
  }

  public async run(): Promise<void> {
    const testName: string = 'Database clients test';
    this.logAndCheck(testName);
  }

  private async testSubscribe(
    action: 'subscribe'|'unsubscribe'
  ): Promise<void> {
    const subscribers: UserData[] = this.testUser.slice(1);
    const subscription: string = this.testUser[0].name;
    const subs: number = (action === 'subscribe') ? 0 :
      subscribers.length;
    const subsCount: { subs: number } = { subs };
    for (const user of subscribers) {
      const subscriber: string = user.name;
      const subs: number = await this.userClient
        .subscribe(subscriber, subscription, action);
      const subsRes: { subs: number } = { subs };
      (action === 'subscribe') ? subsCount.subs++ :
        subsCount.subs--;
      this.check(subsRes, subsCount);
    }
  }

  private async testUserSelect(): Promise<void> {
    const firstUser: UserData = this.testUser[0];
    const subscriptionRes: UserData[] = [
      null, firstUser, firstUser, firstUser
    ];
    const template: string = 'test_user';
    const searchRes: UserData[]|null = await this.userClient
      .searchUsers(template);

    const checkSubsExp: boolean[] = [false, true, true, true];
    for (const i in this.testUser) {
      const user = { ...this.testUser[i] };
      delete user.user_uid;
      this.check(searchRes[i], user);
    
      const { name, email, passwd } = user;
      const signInExp: any = { 
        name,
        passwd,
        notifications: '1'
      };
      const signInRes: UserData|null = await this.userClient
        .signInUser(email, passwd);
      delete signInRes.user_uid;
      this.check(signInRes, signInExp);

      const notification: NotificationsData[] = await this.userClient
        .getNotifications(name);
      const notificationRes: NotificationsData = {
        type: notification[0].type,
        param: notification[0].param,
        extra_values: notification[0].extra_values
      }
      const expectedRes: NotificationsData = {
        type: 'helloMsg',
        param: -1,
        extra_values: null
      }
      this.check(notificationRes, expectedRes);

      const id: number|null = await this.userClient.getUserId(name);
      this.check({ id }, { id: user.id });

      const getUsersRes: UserData[]|null = await this.userClient
        .getUsersData(user, Object.keys(user));
      const getUserRes: UserData|null = await this.userClient
        .getUserData(user, Object.keys(user));
      this.check(getUsersRes[0], user);
      this.check(getUserRes, { ...user, notifications: '1'});

      const subscription: UserData[] = await this.userClient
        .getUserSubsciptions(name);
      const checkSub: boolean = await this.userClient
        .checkSubscription(user.id, firstUser.id);
      this.check(subscription[0] || null, subscriptionRes[i]);
      this.check(checkSub, checkSubsExp[i]);
    }

    const usernames: UserData[]|null = await this.userClient
      .getUsernames(template, firstUser.name);
    const expectedUsers = this.testUser.slice(1);
    for (const i in usernames) {
      const user = expectedUsers[i];
      const username: UserData = usernames[i];
      this.check(username, user);
    }

    const { name, description, passwd } = firstUser;
    const testColumns: UserData = {
      id: 0,
      name,
      name_color: '#000000',
      description,
      email: 'nonexistent_email@gmail.com',
      passwd
    };
    const checkColumnExp: string[] = [
      null, name, null, description, null, passwd
    ];
    const checkColumnRes: string[] = [];
    for (const [key, value] of Object.entries(testColumns))
      checkColumnRes.push(await this.userClient
        .checkColumn(key, value));
    checkColumnRes.forEach((res: string, i: number): void => 
      this.check(res, checkColumnExp[i])
    );

    const limitedBox: string = this.testBox[0].name;
    const limitedBoxOwner: string = name;
    const privilegedUsers: UserData[] = this.testUser.slice(1,3);
    const [limited, editor]: UserData[] = privilegedUsers;
    const limitedBefore: UserData[][] = await this.userClient
        .getLimitedUsers(limitedBoxOwner, limitedBox);
    limitedBefore.forEach((res: UserData[]): void => 
        this.check(res[0] || null, null)
    );
    await this.boxesClient.updateBox(
      limitedBoxOwner,
      limitedBox,
      null,
      [limited.name],
      [editor.name]
    );
    const limitedAfter: UserData[][] = await this.userClient
        .getLimitedUsers(limitedBoxOwner, limitedBox);
    limitedAfter.forEach((res: UserData[], i: number): void => 
      this.check(res[0] || null, privilegedUsers[i])
    );

    const invalidUser: UserData = { 
      id: this.testUser[0].id,
      name: this.testUser[1].name
    };
    const invalidRes: (number|UserData|UserData[])[] = [];
    invalidRes.push(await this.userClient.getUsersData(invalidUser));
    invalidRes.push(await this.userClient.getUserData(invalidUser));
    invalidRes.push(await this.userClient.signInUser('', ''));
    invalidRes.push(await this.userClient.getUserId(''));
    invalidRes.push(await this.userClient.getUsernames(firstUser.name, firstUser.name));
    invalidRes.push(await this.userClient.searchUsers('%')[0] || null);
    this.checkInvalidRes(invalidRes);
  }

  private async testBoxSelect(): Promise<void> {
    for (const i in this.testBox) {
      const box: BoxData = this.testBox[i];
      const owner: UserData = this.testUser[i];
      const { id, name } = owner;
      const [boxId, boxName] = [box.id, box.name];

      const idResult: number|null = await this.boxesClient
        .getUserId(name);
      this.check({ id: idResult }, { id });

      const infoRes: BoxData|null = await this.boxesClient
        .getBoxInfo(boxName, name, name);
      const comparedKeys: string[] = Object.keys(box);
      const infoObj: BoxData|null = Object.keys(infoRes)
        .filter((key: string): boolean => comparedKeys.includes(key))
        .reduce((obj: any, key: string): any => {
          obj[key] = infoRes[key];
          return obj;
        }, {});
      this.check(infoObj, box);
    
      const arg: [string, string] = [name, boxName];
      const idsExp: { id: number, boxId: number } = { id, boxId };
      const [userRes, boxIdRes]: [number, number]|null = await this.boxesClient
        .getUserBoxIds(...arg);
      const findBoxRes: BoxData|null = await this.boxesClient
        .findUserBox(...arg);
      const [accessUser, accessBox]: [number, number] = await this.boxesClient
        .checkBoxAccess(name, name, boxName);
      this.check(findBoxRes, box);
      [
        { id: userRes, boxId: boxIdRes }, 
        { id: accessUser, boxId: accessBox}
      ].forEach((res: any): void => this.check(res, idsExp));
    }

    const getListArgs: [string, string][] = [
      [this.testUser[1].name, this.testUser[0].name],
      [this.testUser[0].name, this.testUser[1].name],
      [this.testUser[3].name, this.testUser[2].name],
      [this.testUser[2].name, this.testUser[3].name]
    ]
    const getListExp: BoxData[] = [
      this.testBox[0], null, this.testBox[2], null
    ];
    for (const i in getListArgs) {
      const arg: [string, string] = getListArgs[i];
      const expVal: BoxData = getListExp[i];
      const result: BoxData[]|null = await this.boxesClient
        .getBoxesList(...arg);
      const res = (result.length) ? result[0] : null;
      this.check(res, expVal);
    }

    const getInfoArgs: string[][] = [
      [this.testBox[3].name, this.testUser[0].name, this.testUser[3].name],
      [this.testBox[0].name, this.testUser[3].name, this.testUser[0].name],
      [this.testBox[1].name, this.testUser[2].name, this.testUser[1].name]
    ];
    const invalidRes: (number|number[]|BoxData)[] = [];
    invalidRes.push(await this.boxesClient.getUserId(''));
    invalidRes.push(await this.boxesClient.getUserBoxIds('', ''));
    invalidRes.push(await this.boxesClient.findUserBox('', ''));
    invalidRes.push(await this.boxesClient.checkBoxAccess(
      this.testUser[3].name,
      this.testUser[0].name,
      this.testBox[3].name
    ));
    for (const i in getInfoArgs) {
      const [boxName, viewer, owner]: string[] = getInfoArgs[i];
      const res = await this.boxesClient.getBoxInfo(boxName, viewer, owner);
      invalidRes.push(res);
    }
    this.checkInvalidRes(invalidRes);
  }

  private checkInvalidRes(resArr: any[]): void {
    resArr.forEach((res: any): void => this.check(res, null));
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
        if (resVal !== expVal) return new Error(errMsg);
      }
    return null;
  }

  private check(
    result: any,
    expected: any
  ): void {
    const testErr = this.equals(result, expected);
    this.addTestResult(testErr);
  }
}
