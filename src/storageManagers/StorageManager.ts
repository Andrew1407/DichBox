import * as fs  from 'fs';
import * as path from 'path';

export default class StorageManager {
  private logosPath: string;

  constructor(logosType: string) {
    this.logosPath  = path.join('../DichStorage/logos', logosType);
  }

  private generateLogoPath(id: number): string {
    return path.join(this.logosPath, id + '.png');
  }

  private appendBase64Header(image: string): string {
    return 'data:image/png;base64,' + image;
  }

  public async getLogoIfExists(id: number): Promise<string|null> {
    const logoPath: string = this.generateLogoPath(id);
    const logoExists = fs.existsSync(logoPath);
    if (!logoExists)
      return null;
    const userLogo: string = await fs.promises
      .readFile(logoPath, 'base64');
    return this.appendBase64Header(userLogo);
  }

  public async saveLogo(
    logo: string,
    id: number
  ): Promise<string> {
    const logoPath: string = this.generateLogoPath(id);
    const base64Data = logo.replace(/^data:image\/png;base64,/, '');
    await fs.promises.writeFile(logoPath, base64Data, 'base64');
    return logo;
  }

  public async removeLogoIfExists(id: number): Promise<void> {
    const logoPath = this.generateLogoPath(id);
    const logoExists = fs.existsSync(logoPath);
    if (logoExists)
     await fs.promises.unlink(logoPath);
  }

  protected async createDir(...pathes: string[]): Promise<void> {
    const dirPath: string = path.join('../DichStorage/boxes', ...pathes);
    await fs.promises.mkdir(dirPath, { recursive: true });
  }

  protected async removeDir(...pathes: string[]): Promise<void> {
    const dirPath: string = path.join('../DichStorage/boxes', ...pathes);
    const exists: boolean = fs.existsSync(dirPath);
    if (exists)
      await fs.promises.rmdir(dirPath, { recursive: true });
  }
}
