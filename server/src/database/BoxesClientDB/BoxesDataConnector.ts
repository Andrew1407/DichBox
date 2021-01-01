import BoxesClientDichBoxDB from './BoxesClientDichBoxDB';
import BoxValidator from '../../validation/BoxValidator';
import { boxData } from '../../datatypes';

export default class BoxesDataConnector extends BoxesClientDichBoxDB {
  private validator: BoxValidator;

  constructor() {
    super();
    this.validator = new BoxValidator();
  }

  private async checkTakenName(
    ownerName: string,
    boxName: string
  ): Promise<boolean> {
    const foundRes: { id: number }[] = await this.selectJoinedValues(
      ['boxes', 'users'],
      ['owner_id', 'id'],
      {},
      ['a.id'],
      `a.name = '${boxName}' and b.name = '${ownerName}'`
    );
    return !!foundRes.length;
  }

  public async insertBox(
    ownerName: string,
    boxData: boxData|null,
    limitedUsers: string[]|null,
    editors: string[]|null
  ): Promise<boxData|null> {
    if (!boxData || !boxData.name)
      return null;
    const correctData: boolean = this.validator.checkDataCreated(boxData);
    if (!correctData) return null;
    const nameTaken: boolean = await this.checkTakenName(ownerName, boxData.name);
    if (nameTaken) return null;
    return await super.insertBox(ownerName, boxData, limitedUsers, editors);
  }

  public async updateBox(
    ownerName: string,
    boxName: string,
    boxData: boxData|null,
    limitedlist: string[]|null = null,
    editorsList: string[]|null = null
  ): Promise<boxData|null> {
    if (boxData) {
      const correctData: boolean = this.validator.checkDataEdited(boxData);
      if (!correctData) return null;
      const nameTaken: boolean = await this.checkTakenName(ownerName, boxData.name);
      if (nameTaken) return null;  
    }
    return await super.updateBox(ownerName, boxName, boxData, limitedlist, editorsList);
  }
}
