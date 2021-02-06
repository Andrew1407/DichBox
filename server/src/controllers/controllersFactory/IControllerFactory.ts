import IBoxesClientDB from '../../database/BoxesClientDB/IBoxesClientDB';
import IUserClientDB from '../../database/UserClientDB/IUserClientDB';
import IBoxesStorageManager from '../../storageManagers/boxes/IBoxesStorageManager';
import IUserStorageManager from '../../storageManagers/user/IUserStorageManager';

export default interface IControllerFactory {
  getConnector(): IUserClientDB|IBoxesClientDB;
  getStorageManager(): IUserStorageManager|IBoxesStorageManager;
}
