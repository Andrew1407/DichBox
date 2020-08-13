import * as fs from 'fs';
import * as path from 'path';
import LogoManager from './LogoManager';

export default class BoxManager {
  private boxLogo: LogoManager;
  private defaultPath: string;

  constructor() {
    this.boxLogo = new LogoManager('boxes');
    this.defaultPath = path.join('..', 'DichStorage/boxes');
  }

  private getPath(...inputPath: string[]): string {
    return path.join(this.defaultPath, ...inputPath);
  }

  public async createBox(
    username: string,
    boxName: string,
    logo: [number, string]|null
  ): Promise<void> {
    const userDir: string = this.getPath(username);
    const userDirExsists: boolean = fs.existsSync(userDir);
    if (!userDirExsists)
      await fs.promises.mkdir(userDir);
    const boxPath: string = this.getPath(username, boxName);
    const boxExists: boolean = fs.existsSync(boxPath);
    if (boxExists) return;
    await fs.promises.mkdir(boxPath);
    if (logo) {
      const [boxId, logoSrc]: [number, string] = logo;
      await this.boxLogo.saveLogo(logoSrc, boxId);
    }
  }

  public async getLogoIfExists(boxId: number): Promise<string|null> {
    return await this.boxLogo.getLogoIfExists(boxId);
  }
}
