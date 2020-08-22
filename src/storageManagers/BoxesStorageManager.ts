import * as fs from 'fs';
import * as path from 'path';
import { pathEntries, dirEntries, fileEntries, entryType } from '../datatypes';
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
    await this.createDir('boxes', ...idsStr);
    if (logo)
      await this.saveLogo(logo, boxId, userId);
  }

  public async removeBox(
    userId: number,
    boxId: number
  ): Promise<void> {
    const idsString: string[] = [userId, boxId]
      .map(x => x.toString());
    await Promise.all([
      this.removeDir('boxes', ...idsString),
      this.removeLogoIfExists(boxId, userId)
    ]);
  }

  private async getDirEntries(dirPath: string): Promise<dirEntries[]> {
    const dirList: string[] = await fs.promises
      .readdir(dirPath);
    const dirMapper = async (name: string): Promise<dirEntries> => {
      const fullPath: string = path.join(dirPath, name);
      const nameStats: fs.Stats = await fs.promises.lstat(fullPath);
      if (await nameStats.isFile())
        return { name, type: 'file' };
      else if (await nameStats.isDirectory())
        return { name, type: 'dir' };
      return { name, type: 'file' };
    };
    const entries: dirEntries[] = await Promise.all(
      dirList.map(dirMapper)
    );
    return entries;
  }

  public async getPathEntries(
    ids: [number, number],
    initial: boolean,
    extraPath: string[]
  ): Promise<pathEntries|null> {
    const idsStr: string[] = ids.map(x => x.toString());
    const boxPath: string = path
      .join('../DichStorage/boxes', ...idsStr, ...extraPath);
    const exists: boolean = fs.existsSync(boxPath);
    if (!exists)
      return null;
    const pathStats: fs.Stats = await fs.promises.lstat(boxPath);
    if (await pathStats.isDirectory()) {
      const src: dirEntries[] = await this.getDirEntries(boxPath);
      const name: string = extraPath.length > 1 ?
        boxPath.split('/').pop() : 'хрін тобі';
      return { dir: { src, name }, type: 'dir' };
    }
    if (await pathStats.isFile()) {
      if (initial)
        return null;
      const src: string = await fs.promises.readFile(boxPath, 'utf-8');
      const dirPath: string[] = boxPath.split('/');
      const name: string = dirPath.pop();
      const file: fileEntries = { src, name };
      const entries: pathEntries = { type: 'file', file };
      return entries;
    }
    return null;
  }

  public async addFile(
    name: string,
    type: entryType,
    ids: [number, number],
    extraPath: string[]
  ): Promise<pathEntries|null> {
    const idsStr: string[] = ids.map(x => x.toString());
    const boxPath: string = path
      .join('../DichStorage/boxes', ...idsStr, ...extraPath);
    const exists: boolean = fs.existsSync(boxPath);
    if (!exists)
      return null;
    const filePath: string = path.join(boxPath, name);
    if (type === 'dir')
      await fs.promises.mkdir(filePath)
    else if (type === 'file')
      await fs.promises.writeFile(filePath, '');
    const src: dirEntries[] = await this.getDirEntries(boxPath);
    return { type, [type]: { src, name } };
  }

  public async readFile(
    name: string,
    type: entryType,
    ids: [number, number],
    extraPath: string[]
  ): Promise<string|null> {
    if (type === 'dir')
      return null;
    const idsStr: string[] = ids.map(x => x.toString());
    const boxPath: string = path
      .join('../DichStorage/boxes', ...idsStr, ...extraPath);
    const exists: boolean = fs.existsSync(boxPath);
    if (!exists)
      return null;
    const filePath: string = path.join(boxPath, name);
    const src: string = await fs.promises
      .readFile(filePath, 'utf-8');
    return src;
  }
}
