import { existsSync as fsExistsSync, promises as fsp, Stats as fsStats }  from 'fs';
import * as path from 'path';
import IBoxesStorageManager from './IBoxesStorageManager';
import { PathEntries, DirEntries, FileEntries, entryType } from '../../datatypes';
import StorageManager from '../StorageManager';

export default class BoxesStorageManager extends StorageManager implements IBoxesStorageManager {
  constructor() {
    super('boxes');
  }

  public async createBox(
    userId: number,
    boxId: number,
    logo: string|null
  ): Promise<void> {
    const idsStr: string[] = [ userId, boxId ].map(
      (x: number): string => x.toString()
    );
    await this.createDir('boxes', ...idsStr);
    if (logo) await this.saveLogo(logo, boxId, userId);
  }

  public async removeBox(
    userId: number,
    boxId: number
  ): Promise<void> {
    const idsString: string[] = [userId, boxId].map(
      (x: number): string => x.toString()
    );
    await Promise.all([
      this.removeDir('boxes', ...idsString),
      this.removeLogoIfExists(boxId, userId)
    ]);
  }

  private idsToString(ids: number[]): string[] {
    const mapper = (x: number): string => x.toString();
    return ids.map(mapper);
  }

  private async getDirEntries(dirPath: string): Promise<DirEntries[]> {
    const dirList: string[] = await fsp.readdir(dirPath);
    const dirMapper = async (name: string): Promise<DirEntries> => {
      const fullPath: string = path.join(dirPath, name);
      const nameStats: fsStats = await fsp.lstat(fullPath);
      if (nameStats.isFile()) {
        const isImage: boolean = /\.(png|jpeg|jpg|webp|tiff|raw|gif|bmp)$/.test(name);
        const type: entryType = isImage ? 'image' : 'file';
        return { name, type };
      }
      else if (nameStats.isDirectory()) {
        return { name, type: 'dir' };
      }
      return { name, type: 'file' };
    };
    const entries: DirEntries[] = await Promise.all(
      dirList.map(dirMapper)
    );
    return entries;
  }

  public async getPathEntries(
    ids: [number, number],
    initial: boolean,
    extraPath: string[]
  ): Promise<PathEntries|null> {
    const idsStr: string[] = this.idsToString(ids);
    const boxPath: string = path
      .join(this.storagePath, 'boxes', ...idsStr, ...extraPath);
    const exists: boolean = fsExistsSync(boxPath);
    if (!exists) return null;
    const pathStats: fsStats = await fsp.lstat(boxPath);
    if (pathStats.isDirectory()) {
      const src: DirEntries[] = await this.getDirEntries(boxPath);
      const name: string = extraPath.length > 1 ?
        boxPath.split('/').pop() : 'хрін тобі';
      return { dir: { src, name }, type: 'dir' };
    }
    if (pathStats.isFile()) {
      if (initial) return null;
      const src: string = await fsp.readFile(boxPath, 'utf-8');
      const dirPath: string[] = boxPath.split('/');
      const name: string = dirPath.pop();
      const file: FileEntries = { src, name };
      const entries: PathEntries = { type: 'file', file };
      return entries;
    }
    return null;
  }

  public async addFile(
    name: string,
    type: entryType,
    ids: [number, number],
    extraPath: string[],
    entries: string|null = null
  ): Promise<PathEntries|null> {
    const idsStr: string[] = this.idsToString(ids);
    const boxPath: string = path
      .join(this.storagePath, 'boxes', ...idsStr, ...extraPath);
    const exists: boolean = fsExistsSync(boxPath);
    if (!exists) return null;
    const filePath: string = path.join(boxPath, name);
    if (type === 'dir')
      await fsp.mkdir(filePath)
    else if (type === 'file')
      await fsp.writeFile(filePath, '');
    else if (type === 'image')
      await fsp.writeFile(filePath, entries);
    const src: DirEntries[] = await this.getDirEntries(boxPath);
    const typeKey: entryType = type === 'dir' ? 'dir' : 'file';
    return { type, [typeKey]: { src, name } };
  }

  public async removeFile(
    name: string,
    type: entryType,
    ids: [number, number],
    extraPath: string[]
  ): Promise<boolean> {
    const idsStr: string[] = this.idsToString(ids);
    const filePath: string = path
      .join(this.storagePath, 'boxes', ...idsStr, ...extraPath, name);
    const exists: boolean = fsExistsSync(filePath);
    if (!exists) return false;
    if (type === 'dir')
      await this.removeDir('boxes', ...idsStr, ...extraPath, name);
    else
      await fsp.unlink(filePath);
    return true;
  }

  public async renameFile(
    newName: string,
    name: string,
    ids: [number, number],
    extraPath: string[]
  ): Promise<boolean> {
    const idsStr: string[] = this.idsToString(ids);
    const dirPath: string = path
      .join(this.storagePath, 'boxes', ...idsStr, ...extraPath);
    const [ oldPath, newPath ]: string[] = [ name, newName ].map(
      (p: string): string => path.join(dirPath, p)
    );
    const exists: boolean = fsExistsSync(oldPath);
    if (!exists) return false;
    await fsp.rename(oldPath, newPath);
    return true;
  }

  public async readFile(
    name: string,
    type: entryType,
    ids: [number, number],
    extraPath: string[]
  ): Promise<string|null> {
    if (type === 'dir') return null;
    const idsStr: string[] = this.idsToString(ids);;
    const boxPath: string = path
      .join(this.storagePath, 'boxes', ...idsStr, ...extraPath);
    const exists: boolean = fsExistsSync(boxPath);
    if (!exists) return null;
    const filePath: string = path.join(boxPath, name);
    const src: string = await fsp.readFile(filePath, 'utf-8');
    return src;
  }

  public async editFile(
    ids: [number, number],
    filePath: string[],
    src: string
  ): Promise<boolean> {
    const idsStr: string[] = ids.map((x: number): string => x.toString());
    const filePathStr: string = path
      .join(this.storagePath, 'boxes', ...idsStr, ...filePath);
    const exists: boolean = fsExistsSync(filePathStr);
    if (!exists) return false;
    await fsp.writeFile(filePathStr, src);
    return true;
  }
}
