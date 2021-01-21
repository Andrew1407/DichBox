export default interface ITesterDB {
  testSelect(): Promise<void>;
  testUpdate(): Promise<void>;
  testDelete(): Promise<void>;
  testInsert(): Promise<void>;
  run(): Promise<void>;
}
