import * as fsp from 'fs/promises';
import * as path from 'path';
import ILogger from '../../../logger/ILogger';
import WrappedLogger from './WrappedLogger';
import TestLogger from '../../TestLogger';
import ITester from '../../ITester';
import LogInfo from '../../../logger/LogInfo';
import { testLogs } from '../../testData/logger';

export default class LoggerTest extends TestLogger implements ITester {
  private equals(result: LogInfo, expected: LogInfo): Error|null {
    const expectedStr: string = JSON.stringify(expected);
    const resultStr: string = JSON.stringify(result);
    const errMsg: string = `FAILED. Incorrect result - expected: \n"${expectedStr}", \ngot: \n"${resultStr}"`;
    if (!result && !expected) return null;
    if (!result || !expected) return new Error(errMsg);
    for (const key in result) {
      const expVal = expected[key];
      const resVal = result[key];
      if (resVal !== expVal) return new Error(errMsg);
    }
    return null;
  }

  private getCurrentLogName(): string {
    return new Date()
      .toLocaleDateString()
      .replace(/\//g, '-')
      .concat('.log');
  }

  private compareParsedData(parsed: LogInfo[]) {
    const lengthEquals: boolean = parsed.length === testLogs.length;
    if (lengthEquals) {
      this.addTestResult(null);
    } else {
      const expectedStr: string = JSON.stringify(testLogs);
      const resultStr: string = JSON.stringify(parsed);
      const errMsg: string = `FAILED. Incorrect result - expected: \n"${expectedStr}", \ngot: \n"${resultStr}"`;
      this.addTestResult(new Error(errMsg));
    }

    for (const i in testLogs) {
      const expected: LogInfo = testLogs[i];
      const result: LogInfo = parsed[i];
      const failed: Error|null = this.equals(result, expected);
      this.addTestResult(failed);
    }    
  }

  public async test(): Promise<void> {
    const testDir: string = 'test-logs';
    const verbose: boolean = false;
    const existedStream: string|null = WrappedLogger.getStreamPath();
    WrappedLogger.closeWriteStream();
    const logger: ILogger = new WrappedLogger(testDir, verbose);
    for (const logData of testLogs) await logger.log(logData);
    WrappedLogger.closeWriteStream();
    const logFile: string = this.getCurrentLogName();
    const logPath: string = path.join(testDir, logFile)
    try {
      const fileEntries: string = await fsp.readFile(logPath, 'utf-8');
      const formattedEntries: string = `[${fileEntries.slice(0, -2)}]`;
      const entriesData: LogInfo[] = JSON.parse(formattedEntries);
      this.compareParsedData(entriesData);
    } catch(e) {
      this.addTestResult(e);
    } finally {
      await fsp.rm(testDir, { recursive: true, force: true });
      if (existedStream) {
        const existedDir: string = path.dirname(existedStream);
        new WrappedLogger(existedDir, verbose);
      }
    }
  }

  public async run(): Promise<void> {
    const testName: string = 'Logger';
    this.logAndCheck(testName);
  }
}
