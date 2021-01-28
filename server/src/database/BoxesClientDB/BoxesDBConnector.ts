import IBoxesClientDB from './IBoxesClientDB';
import BoxesClientDB from './BoxesClientDB';
import IClientDB from '../IClientDB';
import BoxValidator from '../../validation/BoxValidator';
import Validator from '../../validation/Validator';
import { BoxData } from '../../datatypes';

export default class BoxesDBConnector extends BoxesClientDB implements IBoxesClientDB {
  private readonly validator: BoxValidator;

  constructor(dao: IClientDB, validator: Validator) {
    super(dao);
    this.validator = validator;
  }

  private async checkTakenName(
    ownerName: string,
    boxName: string
  ): Promise<boolean> {
    const foundRes: { id: number }[] = await this.daoClient.selectJoinedValues(
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
    boxData: BoxData|null,
    limitedUsers: string[]|null,
    editors: string[]|null
  ): Promise<BoxData|null> {
    if (!(boxData && boxData.name))
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
    boxData: BoxData|null,
    limitedlist: string[]|null = null,
    editorsList: string[]|null = null
  ): Promise<BoxData|null> {
    if (boxData) {
      const correctData: boolean = this.validator.checkDataEdited(boxData);
      if (!correctData) return null;
      const nameTaken: boolean = await this.checkTakenName(ownerName, boxData.name);
      if (nameTaken) return null;  
    }
    return await super.updateBox(ownerName, boxName, boxData, limitedlist, editorsList);
  }
}
