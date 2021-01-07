export default class TestLogger {
  private passedErrors: (Error|null)[] = [];

  protected addTestResult(result: Error|null): void {
    this.passedErrors.push(result);
  }

  protected logAndCheck(testName: string): void {
    const total: number = this.passedErrors.length;
    const errors: Error[] = [];
    for (const err of this.passedErrors)
      if (err) errors.push(err);
    const failed: number = errors.length;
    const passed: number = total - failed;
    const passedSign: string = total === passed ? '[+]' : '[-]';
    const logStr: string = `${testName}. Total: ${total}, passed: ${passed}, failed: ${failed} ${passedSign}.`;
    console.log(logStr);
    if (failed) {
      errors.forEach(
        (e: Error): void => console.error(e)
      );
      process.exit(1);
    }
  }
}
