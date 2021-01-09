import TestLogger from "../TestLogger";
import ITester from '../ITester';
import { formatDate, formatDateTime } from '../../controllers/dateFormatters';

export default class DateFormattterTest extends TestLogger implements ITester {
  private equals(result: string, expected: string): Error|null {
    if (result === expected) return null;
    const errMsg: string = `FAILED. Incorrect result - expected: "${expected}", got: "${result}"`;
    return new Error(errMsg);
  }

  public async test(): Promise<void> {
    type testData = [string, string][];
    type formatFn = (x: string) => string;

    const getResults = (data: testData, formatter: formatFn): void => {
      for (const [arg, exp] of data) {
        const res: string = formatter(arg);
        const testErr: Error|null = this.equals(res, exp);
        this.addTestResult(testErr);
      }
    };

    const dateData: testData = [
      ['2021-11-17T20:37:57.682Z', '11.17.2021'],
      ['2021-01-27T20:37:47.682Z', '01.27.2021'],
      ['2021-01-07T20:37:07.682Z', '01.07.2021']
    ];
    const dateTimeData: testData = [
      ['2021-01-27T20:07:47.682Z', '01.27.2021, 10:07:47 PM'],
      ['2021-11-07T01:37:57.682Z', '11.07.2021, 03:37:57 AM'],
      ['Mon Jan 04 2021 21:04:03 GMT+0200 (Eastern European Standard Time)', '01.04.2021, 09:04:03 PM']
    ];
    
    getResults(dateData, formatDate);
    getResults(dateTimeData, formatDateTime);
  }

  public async run(): Promise<void> {
    const testName: string = 'Date formatters';
    this.logAndCheck(testName);
  }
}
