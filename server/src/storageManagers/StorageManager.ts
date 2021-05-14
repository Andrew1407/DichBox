import * as fs  from 'fs/promises';
import * as path from 'path';
import * as dotenv from 'dotenv';
import IStorageManager from './IStorageManager';

dotenv.config();

export default class StorageManager implements IStorageManager {
  private readonly logosPath: string;
  protected readonly storagePath: string;

  constructor(logosType: string) {
    this.storagePath = process.env.STORAGE_PATH || '../../DichStorage';
    this.logosPath  = path.join(this.storagePath, 'logos', logosType);
  }

  private generateLogoPath(
    id: number,
    extraPath: string[] = []
  ): string {
    return path.join(this.logosPath, ...extraPath, id + '.png');
  }

  private appendBase64Header(image: string): string {
    return 'data:image/png;base64,' + image;
  }

  public async getLogoIfExists(
    id: number,
    extraId: number = 0
  ): Promise<string|null> {
    const logoPath: string =  extraId ?
      this.generateLogoPath(id, [extraId.toString()]) :
      this.generateLogoPath(id);
    const logoExists: boolean = await this.exists(logoPath);
    if (!logoExists)
      return null;
    const userLogo: string = await fs.readFile(logoPath, 'base64');
    return this.appendBase64Header(userLogo);
  }

  public async saveLogo(
    logo: string,
    id: number,
    extraId: number = 0
  ): Promise<string> {
    const logoPath: string =  extraId ?
      this.generateLogoPath(id, [extraId.toString()]) :
      this.generateLogoPath(id);
    const base64Data = logo.replace(/^data:image\/png;base64,/, '');
    await fs.writeFile(logoPath, base64Data, 'base64');
    return logo;
  }

  public async removeLogoIfExists(
    id: number,
    extraId: number = 0
  ): Promise<void> {
    const logoPath: string =  extraId ?
      this.generateLogoPath(id, [extraId.toString()]) :
      this.generateLogoPath(id);
    const logoExists: boolean = await this.exists(logoPath);
    if (logoExists)
     await fs.unlink(logoPath);
  }

  protected async createDir(...pathes: string[]): Promise<void> {
    const dirPath: string = path.join(this.storagePath, ...pathes);
    await fs.mkdir(dirPath, { recursive: true });
  }

  protected async removeDir(...pathes: string[]): Promise<void> {
    const dirPath: string = path.join(this.storagePath, ...pathes);
    const exists: boolean = await this.exists(dirPath);
    if (exists)
      await fs.rmdir(dirPath, { recursive: true });
  }

  protected async exists(filePath: string): Promise<boolean> {
    return await fs.access(filePath)
      .then((): boolean => true)
      .catch((): boolean => false);
  }
}
