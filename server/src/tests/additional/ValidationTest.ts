import TestLogger from "../TestLogger";
import ITester from '../ITester';
import Validator from '../../validation/Validator';
import UserValidator from '../../validation/UserValidator';
import BoxValidator from '../../validation/BoxValidator';
import { testUsersCreate, testUsersEdit } from './testData/testUserData';
import { testBoxes } from './testData/testBoxData';
import { UserData, BoxData } from '../../datatypes';

export default class DateFormattterTest extends TestLogger implements ITester {
  private BoxValidator: Validator;
  private UserValidator: Validator;

  constructor() {
    super();
    this.BoxValidator = new BoxValidator();
    this.UserValidator = new UserValidator();
  }

  public async test(): Promise<void> { 
    await Promise.all([
      this.testUserData(),
      this.testBoxData()
    ]);
  }

  public async run(): Promise<void> {
    const testName: string = 'User & box data validators';
    this.logAndCheck(testName);
  }

  private equals(
    result: boolean,
    expected: boolean,
    dataParsed: string
  ): Error|null {
    if (result === expected) return null;
    const errMsg: string = `FAILED. Wrong validation with:\n"${dataParsed}"`;
    return new Error(errMsg);
  }

  private checkAll(
    validator: Validator,
    args: (UserData|BoxData)[][],
    expexted: boolean[][]
  ): void {
    const [ argsCreate, argsEdit]: (UserData|BoxData)[][] = args;
    const [ expCreate, expEdit ]: boolean[][] = expexted;
    for (const i in argsCreate) {
      const exp: boolean = expCreate[i];
      const arg: UserData|BoxData = argsCreate[i];
      const res: boolean = validator.checkDataCreated(arg);
      const testErr: Error|null = this.equals(res, exp, JSON.stringify(arg));
      this.addTestResult(testErr);
    }
    for (const i in argsEdit) {
      const exp: boolean = expEdit[i];
      const arg: UserData|BoxData = argsEdit[i];
      const res: boolean = validator.checkDataEdited(arg);
      const testErr: Error|null = this.equals(res, exp, JSON.stringify(arg));
      this.addTestResult(testErr);
    }
  }

  private async testBoxData(): Promise<void> {
    const createExpected: boolean[] = [
      true,  false,
      false, false,
      false, false,
      false
    ];

    const editExpected: boolean[] = [
      true,  true,
      false, false,
      false, false,
      false
    ];

    const validator: Validator = this.BoxValidator;
    const args: BoxData[][] = [testBoxes, testBoxes];
    const expected: boolean[][] = [createExpected, editExpected];

    this.checkAll(validator, args, expected);
  }

  private async testUserData(): Promise<void> {
    const createExpected: boolean[] = [
      true,  false, false,
      false, false, false,
      false, false, false,
      false, false, false,
      false, false
    ];

    const editExpected: boolean[] = [
      true,  false, false, false,
      true,  true,  true,  true,
      true,  true,  true,  false,
      false, false, false, false,
      false, false
    ];

    const validator: Validator = this.UserValidator;
    const args: UserData[][] = [testUsersCreate, testUsersEdit];
    const expected: boolean[][] = [createExpected, editExpected];

    this.checkAll(validator, args, expected);
  }

}