import ITester from '../ITester';
import DateFormatterTest from './DateFormatterTest';
import ValidatorTest from './ValidationTest';
import LoggerTest from './logger/LoggerTest';
import Colors from '../../logger/colors';

export default class AdditionalTest implements ITester {
  private readonly tformatter: ITester;
  private readonly tvalidator: ITester;
  private readonly tlogger: ITester;

  constructor() {
    this.tformatter = new DateFormatterTest();
    this.tvalidator = new ValidatorTest();
    this.tlogger = new LoggerTest();
  }

  public async test(): Promise<void> {
    await Promise.all([
      this.tformatter.test(),
      this.tvalidator.test(),
      this.tlogger.test()
    ]);
  }

  public async run(): Promise<void> {
    console.log(Colors.BG_BLACK, Colors.FG_BLUE, 'Additional tests:', Colors.RESET);
    await Promise.all([
      this.tformatter.run(),
      this.tvalidator.run(),
      this.tlogger.run()
    ]);
  }
}
