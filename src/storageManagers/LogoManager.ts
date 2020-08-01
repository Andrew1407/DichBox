import * as fs  from 'fs';
import * as path from 'path';

class LogoManager {
  private logosPath: string = path.join('..', 'DichStorage/logos');
  private generateLogoPath(userId: number): string {
    return path.join(this.logosPath, userId + '.png');
  }
  private appendBase64Header(image: string): string {
    return 'data:image/png;base64,' + image;
  }

  public async getLogo(userId: number): Promise<string|null> {
    const logoPath: string = this.generateLogoPath(userId);
    const logoExists = fs.existsSync(logoPath);
    if (logoExists) {
      const userLogo: string = await fs.promises
        .readFile(logoPath, 'base64');
      return  this.appendBase64Header(userLogo);
    } else {
      return null;
    }
  }

  public async saveLogo(
    logo: string,
    userId: number
  ): Promise<string> {
    const logoPath: string = this.generateLogoPath(userId);
    const base64Data = logo.replace(/^data:image\/png;base64,/, '');
    await fs.promises.writeFile(logoPath, base64Data, 'base64');
    return logo;
  }

  public async removeLogoIfExists(userId: number): Promise<void> {
    const logoPath = this.generateLogoPath(userId);
    const logoExists = fs.existsSync(logoPath);
    if (logoExists)
      await fs.promises.unlink(logoPath);
  }
}

export default LogoManager;
