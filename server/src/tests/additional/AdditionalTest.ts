import ITester from '../ITester';
import DateFormattterTest from './DateFormatterTest';
import ValidatorTest from './ValidationTest';

export default class AdditionalTest implements ITester {
  private tformatter: ITester;
  private tvalidator: ITester;

  constructor() {
    this.tformatter = new DateFormattterTest();
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
