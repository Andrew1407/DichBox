import ITester from '../ITester';
import ITesterDB from './ITesterDB';
import BaseConnectorTest from './testClasses/BaseConnectorTest';
import ClientDBTest from './testClasses/ClientDBTest';
import ConnectorDBTest from './testClasses/ConnectorDBTest';

export default class DatabaseTest implements ITester {
  private baseTest: ITesterDB;
  private clientTest: ITesterDB;
  private connectorTest: ITesterDB;

  constructor() {
    this.baseTest = new BaseConnectorTest();
    this.clientTest = new ClientDBTest();
    this.connectorTest = new ConnectorDBTest();
  }

  public async test(): Promise<void> {
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
    console.log('Database tests:');
    await Promise.all([
      this.baseTest.run(),
      this.clientTest.run(),
      this.connectorTest.run()
    ]);
  }
}
