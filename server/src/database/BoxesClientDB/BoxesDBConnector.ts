import IBoxesClientDB from './IBoxesClientDB';
import BoxesClientDB from './BoxesClientDB';
import IClientDB from '../IClientDB';
import BoxValidator from '../../validation/BoxValidator';
import { BoxData } from '../../datatypes';

export default class BoxesDBConnector extends BoxesClientDB implements IBoxesClientDB {
  private validator: BoxValidator;

  constructor(dao: IClientDB, validator: BoxValidator) {
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
    BoxData: BoxData|null,
    limitedUsers: string[]|null,
    editors: string[]|null
  ): Promise<BoxData|null> {
    if (!BoxData || !BoxData.name)
      return null;
    const correctData: boolean = this.validator.checkDataCreated(BoxData);
    if (!correctData) return null;
    const nameTaken: boolean = await this.checkTakenName(ownerName, BoxData.name);
    if (nameTaken) return null;
    return await super.insertBox(ownerName, BoxData, limitedUsers, editors);
  }

  public async updateBox(
    ownerName: string,
    boxName: string,
    BoxData: BoxData|null,
    limitedlist: string[]|null = null,
    editorsList: string[]|null = null
  ): Promise<BoxData|null> {
    if (BoxData) {
      const correctData: boolean = this.validator.checkDataEdited(BoxData);
      if (!correctData) return null;
      const nameTaken: boolean = await this.checkTakenName(ownerName, BoxData.name);
      if (nameTaken) return null;  
    }
    return await super.updateBox(ownerName, boxName, BoxData, limitedlist, editorsList);
  }
}
