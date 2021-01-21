import ITester from '../ITester';
import BaseSMTest from './testClasses/BaseSMTest';
import UserSMTest from './testClasses/UserSMTest';
import BoxesSMTest from './testClasses/BoxesSMTest';

export default class  FileSystemTest implements ITester {
  private baseTest: ITester;
  private userTest: ITester;
  private boxesTest: ITester;

  constructor() {
    this.baseTest = new BaseSMTest();
    this.userTest = new UserSMTest();
    this.boxesTest = new BoxesSMTest();
  }

  public async test(): Promise<void> {
    await this.baseTest.test();
    await this.userTest.test();
    await this.boxesTest.test();
  }

  public async run(): Promise<void> {
    console.log('File system tests:');
    await Promise.all([
      this.baseTest.run(),
      this.userTest.run(),
      this.boxesTest.run()
    ]);
  }
}
