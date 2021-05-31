import ClientDB from '../database/ClientDB';
import Colors from '../logger/colors';
import Logger from '../logger/Logger';

export default abstract class TestLogger {
  private readonly passedErrors: (Error|null)[] = [];

  protected addTestResult(result: Error|null): void {
    this.passedErrors.push(result);
  }

  protected logAndCheck(testName: string): void {
    const total: number = this.passedErrors.length;
    const errors: Error[] = this.passedErrors
      .filter((e: Error|null): boolean => !!e);
    const failed: number = errors.length;
    const passed: number = total - failed;
    const passedSign: string = total === passed ? ' ✔️ ' : ' ❌ ';
    const logStr: string = ` - ${testName}. Total: ${total}, passed: ${passed}, failed: ${failed} [${passedSign}].`;
    console.log(Colors.BG_BLACK, Colors.FG_BLUE, logStr, Colors.RESET);
    if (failed) {
      errors.forEach((e: Error): void => 
        console.error(Colors.BG_BLACK, Colors.FG_RED, e, Colors.RESET)
      );
      ClientDB.getInstance().closePool();
      Logger.closeWriteStream();
      process.exit(1);
    }
  }
}
