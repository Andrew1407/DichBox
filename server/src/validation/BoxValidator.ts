import Validator from './Validator';
import { boxData } from '../datatypes';

export default class BoxValidator extends Validator {
  public checkDataCreated(data: boxData): boolean {
    if (!this.patterns.name.test(data.name))
      return false;
    return this.checkDataEdited(data);
  }

  public checkDataEdited(data: boxData): boolean {
    const specificFileds: {
      access_level: (x: string) => boolean
    } = {
      access_level: x => /^(public|private|followers|limited)$/.test(x)
    };
    return super.checkFields(data, specificFileds);
  }
}
