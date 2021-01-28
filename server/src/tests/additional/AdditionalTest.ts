import ITester from '../ITester';
import DateFormatterTest from './DateFormatterTest';
import ValidatorTest from './ValidationTest';

export default class AdditionalTest implements ITester {
  private readonly tformatter: ITester;
  private readonly tvalidator: ITester;

  constructor() {
    this.tformatter = new DateFormatterTest();
    this.tvalidator = new ValidatorTest();
  }

  public async test(): Promise<void> {
    await Promise.all([
      this.tformatter.test(),
      this.tvalidator.test()
    ]);
  }

  public async run(): Promise<void> {
    console.log('Additional tests:');
    await Promise.all([
      this.tformatter.run(),
      this.tvalidator.run()
    ]);
  }
}
