import StorageManager from './StorageManager';

export default class BoxesStorageManager extends StorageManager {
  constructor() {
    super('boxes');
  }

  public async createBox(
    userId: number,
    boxId: number,
    logo: string|null
  ): Promise<void> {
    const idsStr: string[] =
      [ userId, boxId ].map(x => x.toString());
    await this.createDir(...idsStr);
    if (logo)
      await this.saveLogo(logo, boxId);
  }
}
