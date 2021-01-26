import BoxesDBConnector from '../../database/BoxesClientDB/BoxesDBConnector';
import IBoxesClientDB from '../../database/BoxesClientDB/IBoxesClientDB';
import ClientDB from '../../database/ClientDB';
import IClientDB from '../../database/IClientDB';
import BoxesStorageManager from '../../storageManagers/boxes/BoxesStorageManager';
import IBoxesStorageManager from '../../storageManagers/boxes/IBoxesStorageManager';
import BoxValidator from '../../validation/BoxValidator';
import Validator from '../../validation/Validator';
import IControllerFactory from './IControllerFactory';

export default class BoxesControllerFactory implements IControllerFactory {
  getConnector(): IBoxesClientDB {
    const dao: IClientDB = ClientDB.getInstance();
    const validator: Validator = new BoxValidator();
    dao.openPool();
    return new BoxesDBConnector(dao, validator);
  }

  getStorageManager(): IBoxesStorageManager {
    return new BoxesStorageManager();
  }
}
