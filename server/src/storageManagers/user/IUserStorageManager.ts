import IStorageManager from '../IStorageManager';

export default interface IUserStorageManager extends IStorageManager {
  removeUser(id: number): Promise<void>;
  createUserStorage(id: number): Promise<void>;
}
