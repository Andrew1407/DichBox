import StorageManager from './StorageManager';

export default class UserStorageManager extends StorageManager {
  constructor() {
    super('users');
  }

  public async removeUser(id: number): Promise<void> {
    const rmPath: string[] = ['boxes', id.toString()];
    await Promise.all([
      this.removeDir(...rmPath),
      this.removeDir('logos', ...rmPath),
      this.removeLogoIfExists(id)
    ]);
  }

  public async createUserStorage(id: number): Promise<void> {
    const idStr: string = id.toString();
    await Promise.all([
      this.createDir('boxes', idStr),
      this.createDir('logos', 'boxes', idStr)
    ]);
  }
}
