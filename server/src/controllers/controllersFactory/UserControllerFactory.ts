import ClientDB from '../../database/ClientDB';
import IClientDB from '../../database/IClientDB';
import IUserClientDB from '../../database/UserClientDB/IUserClientDB';
import UserDBConnector from '../../database/UserClientDB/UserDBConnector';
import IUserStotageManager from '../../storageManagers/user/IUserStorageManager';
import UserStorageManager from '../../storageManagers/user/UserStorageManager';
import UserValidator from '../../validation/UserValidator';
import Validator from '../../validation/Validator';
import IControllerFactory from './IControllerFactory';

export default class UserControllerFactory implements IControllerFactory {
  getConnector(): IUserClientDB {
    const dao: IClientDB = ClientDB.getInstance();
    const validator: Validator = new UserValidator();
    dao.openPool();
    return new UserDBConnector(dao, validator);
  }

  getStorageManager(): IUserStotageManager {
    return new UserStorageManager();
  }
}
