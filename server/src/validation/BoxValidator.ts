import Validator from './Validator';
import { BoxData } from '../datatypes';

export default class BoxValidator extends Validator {
  public checkDataCreated(data: BoxData): boolean {
    if (!this.patterns.name.test(data.name))
      return false;
    return this.checkDataEdited(data);
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
