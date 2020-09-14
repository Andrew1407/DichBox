import Validator from './Validator';
import { userData } from '../datatypes';

export default class UserValidator extends Validator {
  public checkDataCreated(data: userData): boolean {
    const checkFields: string[] = ['name', 'email', 'passwd']; 
    const dataCorrect: boolean = !!checkFields.reduce((res, key) => 
      res && this.patterns[key].test(data[key])
    );
    return dataCorrect;
  }

  public checkDataEdited(data: userData): boolean {
    const specifiFields: {
      email: (x: string) => boolean,
      passwd: (x: string) => boolean,
    } = {
      email: x => this.patterns.email.test(x),
      passwd: x => this.patterns.passwd.test(x)
    };
    return this.checkFields(data, specifiFields);
  }
}
