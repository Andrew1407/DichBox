import TestLogger from '../../TestLogger';
import ITester from '../../ITester';
import IUserStorageManager from '../../../storageManagers/user/IUserStorageManager';
import UserStorageManager from '../../../storageManagers/user/UserStorageManager';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config();

export default class UserSMTest extends TestLogger implements ITester {
  private readonly userStorageManager: IUserStorageManager;
  private readonly dirPath: string;

  constructor() {
    super();
    this.userStorageManager = new UserStorageManager();
    const storagePath = process.env.STORAGE_PATH || '../../DichStorage';
    this.dirPath = path.join(storagePath, 'boxes');
  }

  public async test(): Promise<void> {
    await this.testCreateUserDir();
    await this.testRemoveUserDir();
  }

  public async run(): Promise<void> {
    const testName: string = 'User storage manager test';
    this.logAndCheck(testName);
  }

  private async testCreateUserDir(): Promise<void> {
    const id: number = 0;
    const errMsg: string = `FAILED. Unexpected behavior while creating user directory`;
    await this.userStorageManager.createUserStorage(id);
    const dirPath: string = this.getUserDirPath(id);
    const dirExists: boolean = fs.existsSync(dirPath);
    const dirStat: fs.Stats = await fs.promises.lstat(dirPath);
    const isDir: boolean = await dirStat.isDirectory();
    (dirExists && isDir) ? this.addTestResult(null) :
      this.addTestResult(new Error(errMsg));
  }

  private async testRemoveUserDir(): Promise<void> {
    const id: number = 0;
    const errMsg: string = `FAILED. Unexpected behavior while deleting user directory`;
    await this.userStorageManager.removeUser(id);
    const dirPath: string = this.getUserDirPath(id);
    const dirExists: boolean = fs.existsSync(dirPath);
    !dirExists ? this.addTestResult(null) :
      this.addTestResult(new Error(errMsg))
  }

  private getUserDirPath(id: number): string {
    return path.join(this.dirPath, id.toString());
  }
}
