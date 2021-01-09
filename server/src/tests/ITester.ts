export default interface ITester {
  test(): Promise<void>;
  run(): Promise<void>;
}
