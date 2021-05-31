import ClientDB from '../../database/ClientDB';
import ITester from '../ITester';
import ITesterDB from './ITesterDB';
import BaseConnectorTest from './testClasses/BaseConnectorTest';
import ClientDBTest from './testClasses/ClientDBTest';
import ConnectorDBTest from './testClasses/ConnectorDBTest';
import Colors from '../../logger/colors';

export default class DatabaseTest implements ITester {
  private readonly baseTest: ITesterDB;
  private readonly clientTest: ITesterDB;
  private readonly connectorTest: ITesterDB;

  constructor() {
    this.baseTest = new BaseConnectorTest();
    this.clientTest = new ClientDBTest();
    this.connectorTest = new ConnectorDBTest();
  }

  public async test(): Promise<void> {
    await ClientDB.getInstance().openPool();

    await this.baseTest.testInsert();
    await this.baseTest.testUpdate();
    await this.baseTest.testSelect();
    await this.baseTest.testDelete();

    await this.clientTest.testInsert();
    await this.clientTest.testUpdate();
    await this.clientTest.testSelect();
    await this.clientTest.testDelete();
    
    await this.connectorTest.testInsert();
    await this.connectorTest.testUpdate();
    await this.connectorTest.testSelect();
    await this.connectorTest.testDelete();
  }

  public async run(): Promise<void> {
    console.log(Colors.BG_BLACK, Colors.FG_BLUE, 'Database tests:', Colors.RESET);
    await Promise.all([
      this.baseTest.run(),
      this.clientTest.run(),
      this.connectorTest.run()
    ]);
  }
}
