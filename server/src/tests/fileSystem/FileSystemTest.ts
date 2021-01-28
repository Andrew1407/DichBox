import ITester from '../ITester';
import BaseSMTest from './testClasses/BaseSMTest';
import UserSMTest from './testClasses/UserSMTest';
import BoxesSMTest from './testClasses/BoxesSMTest';

export default class  FileSystemTest implements ITester {
  private readonly fsTests: ITester[];
  
  constructor() {
    this.fsTests = [
      new BaseSMTest(),
      new UserSMTest(),
      new BoxesSMTest()
    ];
  }

  public async test(): Promise<void> {
    for (const test of this.fsTests)
      await test.test();
  }

  public async run(): Promise<void> {
    console.log('File system tests:');
    const runTest = (test: ITester) => (): Promise<void> => test.test();
    await Promise.all(this.fsTests.map(runTest));
  }
}
