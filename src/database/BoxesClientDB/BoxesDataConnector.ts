import BoxesClientDichBoxDB from './BoxesClientDichBoxDB';
import BoxValidator from '../../validation/BoxValidator';
import { boxData } from '../../datatypes';

export default class BoxesDataConnector extends BoxesClientDichBoxDB {
  private validator: BoxValidator;

  constructor() {
    super();
    this.validator = new BoxValidator();
  }

  public async insertBox(
    ownerName: string,
    boxData: boxData|null,
    limitedUsers: string[]|null,
    editors: string[]|null
  ): Promise<boxData|null> {
    if (!boxData) return null;
    const correctData: boolean = this.validator.checkDataCreated(boxData);
    if (!correctData) return null;
    return await super.insertBox(ownerName, boxData, limitedUsers, editors);
  }

  public async updateBox(
    ownerName: string,
    boxName: string,
    boxData: boxData|null,
    limitedlist: string[]|null = null,
    editorslist: string[]|null = null
  ): Promise<boxData|null> {
    if (!boxData) return null;
    const correctData: boolean = this.validator.checkDataEdited(boxData);
    if (!correctData) return null;
    return await super.updateBox(ownerName, boxName, boxData, limitedlist, editorslist);
  }
}
