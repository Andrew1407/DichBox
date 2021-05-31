import TestLogger from '../../TestLogger';
import ITesterDB from '../ITesterDB';
import ClientDB from '../../../database/ClientDB';
import IClientDB from '../../../database/IClientDB';
import { testBox, testUser } from '../../testData/database';
import { UserData, BoxData } from '../../../datatypes';

export default class BaseConnectorTest extends TestLogger implements ITesterDB {
  private readonly clientDB: IClientDB;
  private readonly testBox: BoxData[];
  private readonly testUser: UserData[];

  constructor() {
    super();
    type testData = BoxData|UserData;
    const copyData = (data: testData[]): testData[] => {
      return data.slice(0, 2)
        .map((obj: testData): testData => ({ ...obj }));
    };
    this.clientDB = ClientDB.getInstance();
    this.testBox = copyData(testBox);
    this.testUser = copyData(testUser);
  }

  public async testInsert(): Promise<void> {
    const insertBox: BoxData = this.testBox[0];
    const insertUser: UserData = this.testUser[0];
    const insertUserResult: UserData = await this.clientDB.insertValue(
      'users',
      insertUser,
      ["id", ...Object.keys(insertUser)]    
    );
    const person_id: number = insertUserResult.id;
    insertUser.id = person_id;
    insertBox.owner_id = person_id;
    const insertBoxResult: BoxData = await this.clientDB.insertValue(
      'boxes',
      insertBox,
      ["id", ...Object.keys(insertBox)]    
    );
    const box_id: number = insertBoxResult.id;
    insertBox.id = box_id;
    const editorEntry: { box_id: number, person_id: number } = {
      box_id, person_id
    };
    const insertEditorResult: any = await this.clientDB.insertValue(
      'box_editors',
      editorEntry    
    );
    const results: any[] = [insertUserResult, insertBoxResult, insertEditorResult];
    const expected = [insertUser, insertBox, editorEntry];
    for (const i in results)
      this.check(results[i], expected[i]);
  }

  public async testSelect(): Promise<void> {
    const [ validSelectBox, invalidSelectBox ]: BoxData[] = this.testBox;
    const [ validSelectUser, invalidSelectUser ]: UserData[] = this.testUser;
    const person_id: number = validSelectUser.id;
    const joinReturnValues: string[] = [
      'a.id as id',
      'a.name as name',
      'a.description as description',
      'a.name_color as name_color',
      'a.description_color as description_color',
      'access_level',
    ];
    
    const selectValuesValid: [string, UserData, string[]] = [
      'users',
      validSelectUser,
      Object.keys(validSelectUser)
    ]
    const selectValuesInvalid: [string, UserData] = [
      'boxes',
      invalidSelectBox
    ];
    const joinValid: [
      string[], string[], { owner_id: number }, string[]] = [
        ['boxes', 'users'],
        ['owner_id', 'id'],
        { owner_id: person_id },
        joinReturnValues
      ];
    const joinInvalid: [string[], string[], BoxData] = [
      ['boxes', 'users'],
      ['owner_id', 'id'],
      { owner_id: 0 }
    ];
    const doubleJoinValid: [
      string[], string[], { person_id: number }, string[]] = [
        ['boxes', 'box_editors', 'users'],
        ['a.id = b.box_id', 'a.owner_id = c.id'],
        { person_id },
        joinReturnValues
      ];
    const doubleJoinInvalid: [
      string[], string[], { person_id: number }, string[]] = [
        ['boxes', 'box_editors', 'users'],
        ['a.id = b.box_id', 'a.owner_id = c.id'],
        { person_id: 0 },
        joinReturnValues
      ];

    const getIdRes: number = await this.clientDB.getUserId(validSelectUser.name);
    const getIdNull: number = await this.clientDB.getUserId(invalidSelectUser.name);
    const selectRes: any[] = await this.clientDB.selectValues(...selectValuesValid);
    const selectNull: any[] = await this.clientDB.selectValues(...selectValuesInvalid);
    const joinRes: any[] = await this.clientDB.selectJoinedValues(...joinValid);
    const joinEmpty: any[] = await this.clientDB.selectJoinedValues(...joinInvalid);
    const doubleJoinRes: any[] = await this.clientDB.selectDoubleJoinedValues(...doubleJoinValid);
    const doubleJoinEmpty: any[] = await this.clientDB.selectDoubleJoinedValues(...doubleJoinInvalid);

    this.check(getIdRes, validSelectUser.id);
    this.check(getIdNull, null);
    this.check(selectRes[0] || null, validSelectUser);
    this.check(selectNull, null);
    this.check(joinRes[0] || null, validSelectBox);
    this.check(joinEmpty[0] || null, null);
    this.check(doubleJoinRes[0] || null, validSelectBox);
    this.check(doubleJoinEmpty[0] || null, null);
  }

  public async testUpdate(): Promise<void> {
    const initialUser: UserData = this.testUser[0];
    const updatedUser: UserData = { ...initialUser };
    updatedUser.name = 'new_' + updatedUser.name;
    updatedUser.id = initialUser.id;
    const updateData: [string, number, UserData, string[]][] = [
      ['users', initialUser.id, updatedUser, Object.keys(initialUser)],
      ['users', 0, initialUser, Object.keys(initialUser)]
    ];
    const expected: UserData[] = [updatedUser, null];
    for (const i in updateData) {
      const arg: [string, number, UserData, string[]] = updateData[i];
      const expValue: any = expected[i];
      const result: any = await this.clientDB.updateValueById(...arg);
      this.check(result, expValue);
    }
    initialUser.name = updatedUser.name;
  }

  public async testDelete(): Promise<void> {
    const deleteBox: BoxData = this.testBox[0];
    const deleteUser: UserData = this.testUser[0];
    const person_id: number = deleteUser.id;
    const box_id: number = deleteBox.id;
    const rmValues: [string, any][] = [
      ['box_editors', { box_id, person_id }],
      ['boxes', deleteBox],
      ['users', deleteUser]
    ];
    for (const arg of rmValues) {
      await this.clientDB.removeValue(...arg);
      const selectRes = await this.clientDB.selectValues(...arg);
      this.check(selectRes, null);
    }
  }

  public async run(): Promise<void> {
    const testName: string = 'Base connector test';
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
