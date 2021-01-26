import IBoxesClientDB from '../../database/BoxesClientDB/IBoxesClientDB';
import IUserClientDB from '../../database/UserClientDB/IUserClientDB';
import IBoxesStorageManager from '../../storageManagers/boxes/IBoxesStorageManager';
import IUserStotageManager from '../../storageManagers/user/IUserStorageManager';

export default interface IControllerFactory {
  getConnector(): IUserClientDB|IBoxesClientDB;
  getStorageManager(): IUserStotageManager|IBoxesStorageManager;
}
