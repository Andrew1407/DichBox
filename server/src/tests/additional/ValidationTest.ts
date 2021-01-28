import TestLogger from '../TestLogger';
import ITester from '../ITester';
import Validator from '../../validation/Validator';
import UserValidator from '../../validation/UserValidator';
import BoxValidator from '../../validation/BoxValidator';
import { testUsersCreate, testUsersEdit } from '../testData/additionalUsers';
import { testBoxes } from '../testData/additionalBoxes';
import { UserData, BoxData } from '../../datatypes';

export default class DateFormatterTest extends TestLogger implements ITester {
  private readonly BoxValidator: Validator;
  private readonly UserValidator: Validator;

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
    dataStringified: string
  ): Error|null {
    if (result === expected) return null;
    const errMsg: string = `FAILED. Wrong validation with:\n"${dataStringified}"`;
    return new Error(errMsg);
  }

  private checkAll(
    validator: Validator,
    args: (UserData|BoxData)[][],
    expeсted: boolean[][]
  ): void {
    const [ argsCreate, argsEdit]: (UserData|BoxData)[][] = args;
    const [ expCreate, expEdit ]: boolean[][] = expeсted;
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
