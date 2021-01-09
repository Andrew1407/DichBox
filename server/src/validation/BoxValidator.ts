import Validator from './Validator';
import { BoxData } from '../datatypes';

export default class BoxValidator extends Validator {
  public checkDataCreated(data: BoxData): boolean {
    const nameVaid: RegExp = this.patterns.name;
    if (data.name && nameVaid.test(data.name))
      return this.checkDataEdited(data);
    return false;
  }

  public checkDataEdited(data: BoxData): boolean {
    const specificFileds: {
      access_level: (x: string) => boolean
    } = {
      access_level: x => /^(public|private|followers|limited)$/.test(x)
    };
    return super.checkFields(data, specificFileds);
  }
}
