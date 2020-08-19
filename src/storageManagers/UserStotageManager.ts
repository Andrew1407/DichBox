import StorageManager from './StorageManager';

export default class UserStorageManager extends StorageManager {
  constructor() {
    super('users');
  }

  public async removeUser(id: number): Promise<void> {
    await Promise.all([
      this.removeDir(id.toString()),
      this.removeLogoIfExists(id)
    ]);
  }
}
