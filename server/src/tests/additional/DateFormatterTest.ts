import TestLogger from '../TestLogger';
import ITester from '../ITester';
import { formatDate, formatDateTime } from '../../controllers/dateFormatters';

export default class DateFormattterTest extends TestLogger implements ITester {
  private fits(result: string, template: RegExp): Error|null {
    if (template.test(result)) return null;
    const errMsg: string = `FAILED. Incorrect result - got: "${result}"`;
    return new Error(errMsg);
  }

  private getResults (
    data: string[],
    formatter: (x: string) => string,
    template: RegExp
  ): void {
    for (const arg of data) {
      const res: string = formatter(arg);
      const testErr: Error|null = this.fits(res, template);
      this.addTestResult(testErr);
    }
  }

  public async test(): Promise<void> {
    const dateTemplate: RegExp = /^\d{2}\.\d{2}\.\d{4}$/;
    const dateTimeTemplate: RegExp = /^\d{2}\.\d{2}\.\d{4}, \d{2}:\d{2}:\d{2}( PM| AM)?$/;
    const dateData: string[] = [
      '2021-11-17T20:37:57.682Z',
      '2021-01-27T20:37:47.682Z',
      '2021-01-07T20:37:07.682Z'
    ];
    const dateTimeData: string[] = [
      '2021-01-27T20:07:47.682Z',
      '2021-11-07T01:37:57.682Z',
      'Mon Jan 04 2021 21:04:03 GMT+0200 (Eastern European Standard Time)'
    ];
    
    this.getResults(dateData, formatDate, dateTemplate);
    this.getResults(dateTimeData, formatDateTime, dateTimeTemplate);
  }

  public async run(): Promise<void> {
    const testName: string = 'Date formatters';
    this.logAndCheck(testName);
  }
}
