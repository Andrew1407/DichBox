import TestLogger from '../../TestLogger';
import ITester from '../../ITester';
import IStorageManager from '../../../storageManagers/IStorageManager';
import StorageManager from '../../../storageManagers/StorageManager';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config();

export default class BaseSMTest extends TestLogger implements ITester {
  private storageManager: IStorageManager;
  private logosPath: string;

  constructor() {
    super();
    const testDir: string = 'test';
    this.storageManager = new StorageManager(testDir);
    const storagePath = process.env.STORAGE_PATH || '../../DichStorage';
    this.logosPath = path.join(storagePath, 'logos', testDir);
  }

  public async test(): Promise<void> {
    await this.createTestDir();
    await this.testSaveLogo();
    await this.testGetLogo();
    await this.testRemoveLogo();
    await this.removeTestDir();
  }

  public async run(): Promise<void> {
    const testName: string = 'Base storage manager test';
    this.logAndCheck(testName);
  }

  private async createTestDir(): Promise<void> {
    await fs.promises.mkdir(this.logosPath, { recursive: true });
  }

  private async removeTestDir(): Promise<void> {
    await fs.promises.rmdir(this.logosPath, { recursive: true });
  }

  private async testSaveLogo(): Promise<void> {
    const id: number = 0;
    const sourcePath: string = '../client/src/styles/imgs/dich-icon.png';
    const errMsg: string = `FAILED. Unexpected behavior while saving logo`;
    const testLogo: string = await fs.promises.readFile(sourcePath, 'base64');
    const logoPath: string = this.getLogoPath(id);
    await this.storageManager.saveLogo(testLogo, id);
    const fileExists: boolean = fs.existsSync(logoPath);
    const fileStat: fs.Stats = await fs.promises.lstat(logoPath);
    const isFile: boolean = await fileStat.isFile();
    (fileExists && isFile) ? this.addTestResult(null) :
      this.addTestResult(new Error(errMsg));
  }

  private async testGetLogo(): Promise<void> {
    const getLogoRes: string|null = await this.storageManager
      .getLogoIfExists(0);
    const errMsg: string = `FAILED. Unexpected behavior while getting logo`;
    (getLogoRes) ? this.addTestResult(null) :
      this.addTestResult(new Error(errMsg));
  }

  private async testRemoveLogo(): Promise<void> {
    const id: number = 0;
    const logoPath: string = this.getLogoPath(id);
    const errMsg: string = `FAILED. Unexpected behavior while deleting logo`;
    await this.storageManager.removeLogoIfExists(id);
    const fileExists: boolean = fs.existsSync(logoPath);
    !fileExists ? this.addTestResult(null) :
      this.addTestResult(new Error(errMsg));
  }

  private getLogoPath(id: number): string {
    return path.join(this.logosPath, id + '.png');
  }
}
