import Validator from './Validator';
import { UserData } from '../datatypes';

export default class UserValidator extends Validator {
  public checkDataCreated(data: UserData): boolean {
    const checkFields: string[] = ['name', 'email', 'passwd']; 
    const dataCorrect: boolean = !!checkFields.reduce((res, key) => 
      res && this.patterns[key].test(data[key])
    );
    return dataCorrect;
  }

  public checkDataEdited(data: UserData): boolean {
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
