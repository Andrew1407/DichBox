import { boxData, userData } from '../datatypes';
import BoxValidator from './BoxValidator';
import UserValidator from './UserValidator';

export default abstract class Validator {
  protected patterns: {
    name: RegExp,
    passwd: RegExp,
    email: RegExp,
    color: RegExp
  }

  constructor() {
    this.patterns = {
      name: /^[^\s/]{1,40}$/,
      passwd: /^[\S]{5,20}$/,
      email: /^([a-z_\d\.-]+)@([a-z\d]+)\.([a-z]{2,8})(\.[a-z]{2,8})*$/,
      color: /^#[a-z\d]{6}$/
    };
  }

  protected checkFields(
    data: userData|boxData,
    specificFields: any
  ): boolean {
    const fieldsCheck: any = {
      ...specificFields,
      name: x => this.patterns.name.test(x),
      name_color: x => this.patterns.color.test(x),
      description: x => !!x && x.length <= 100,
      description_color: x => this.patterns.color.test(x),
    };
    const dataCorrect: boolean = !!Object.keys(data)
      .reduce((res, key) => 
        ( key in fieldsCheck ?
          res && fieldsCheck[key](data[key]) : res )
      );
    return dataCorrect;
  };

  abstract checkDataCreated(data: userData|boxData): boolean;
  abstract checkDataEdited(data: userData|boxData): boolean;
}
