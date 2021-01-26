import ClientDB from '../database/ClientDB';

export default abstract class TestLogger {
  private passedErrors: (Error|null)[] = [];

  protected addTestResult(result: Error|null): void {
    this.passedErrors.push(result);
  }

  protected logAndCheck(testName: string): void {
    const total: number = this.passedErrors.length;
    const errors: Error[] = this.passedErrors
      .filter((e: Error|null): boolean => !!e);
    const failed: number = errors.length;
    const passed: number = total - failed;
    const passedSign: string = total === passed ? ' ✔️ ' : ' ❌';
    const logStr: string = ` - ${testName}. Total: ${total}, passed: ${passed}, failed: ${failed} [${passedSign}].`;
    console.log(logStr);
    if (failed) {
      errors.forEach(
        (e: Error): void => console.error(e)
      );
      
      ClientDB.getInstance().closePool();
      process.exit(1);
    }
  }
}
