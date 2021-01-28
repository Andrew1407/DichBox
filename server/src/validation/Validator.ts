import { BoxData, UserData } from '../datatypes';

export default abstract class Validator {
  protected readonly patterns: {
    name: RegExp,
    passwd: RegExp,
    email: RegExp,
    color: RegExp
  };

  constructor() {
    this.patterns = {
      name: /^[^\s/]{1,40}$/,
      passwd: /^[\S]{5,20}$/,
      email: /^([a-z_\d\.-]+)@([a-z\d]+)\.([a-z]{2,8})(\.[a-z]{2,8})*$/,
      color: /^#[a-z\d]{6}$/
    };
  }

  protected checkFields(
    data: UserData|BoxData,
    specificFields: any
  ): boolean {
    const fieldsCheck: any = {
      ...specificFields,
      name: (x: string): boolean => this.patterns.name.test(x),
      name_color: (x: string): boolean => this.patterns.color.test(x),
      description: (x: string): boolean => !!x && x.length <= 100,
      description_color: (x: string): boolean => this.patterns.color.test(x),
    };
    const reducer = (res: boolean, key: string): boolean => (
      key in fieldsCheck ?
        res && fieldsCheck[key](data[key]) : res 
    );
    const dataCorrect: boolean = Object.keys(data)
      .reduce(reducer, true);
    return dataCorrect;
  };

  abstract checkDataCreated(data: UserData|BoxData): boolean;
  abstract checkDataEdited(data: UserData|BoxData): boolean;
}
