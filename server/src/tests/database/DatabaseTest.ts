import ClientDB from '../../database/ClientDB';
import ITester from '../ITester';
import ITesterDB from './ITesterDB';
import BaseConnectorTest from './testClasses/BaseConnectorTest';
import ClientDBTest from './testClasses/ClientDBTest';
import ConnectorDBTest from './testClasses/ConnectorDBTest';
import Colors from '../../logger/colors';

export default class DatabaseTest implements ITester {
  private readonly tests: ITesterDB[];

  constructor() {
    this.tests = [
      new BaseConnectorTest(),
      new ClientDBTest(),
      new ConnectorDBTest()
    ]
  }

  public async test(): Promise<void> {
    await ClientDB.getInstance().openPool();

    for (const test of this.tests) { 
      await test.testInsert();
      await test.testUpdate();
      await test.testSelect();
      await test.testDelete();
    }
  }

  public async run(): Promise<void> {
    console.log(Colors.BG_BLACK, Colors.FG_BLUE, 'Database tests:', Colors.RESET);
    const runner = (t: ITesterDB): Promise<void> => t.run();
    await Promise.all(this.tests.map(runner));
  }
}
