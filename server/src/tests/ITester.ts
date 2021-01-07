export default interface Tester {
  test(): Promise<void>;
  run(): Promise<void>;
}
