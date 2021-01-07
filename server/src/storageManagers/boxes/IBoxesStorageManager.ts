import {entryType, PathEntries } from '../../datatypes';

export default interface IBoxesStorageManager {
  createBox(userId: number, boxId: number, logo: string|null): Promise<void>;
  removeBox(userId: number, boxId: number): Promise<void>;
  
  getLogoIfExists(id: number, extraId?: number): Promise<string|null>;
  saveLogo(logo: string, id: number, extraId?: number): Promise<string>;
  removeLogoIfExists(id: number, extraId?: number): Promise<void>;


  getPathEntries(
    ids: [number, number],
    initial: boolean,
    extraPath: string[]
  ): Promise<PathEntries|null>;

  addFile(
    name: string,
    type: entryType,
    ids: [number, number],
    extraPath: string[],
    entries?: string|null
  ): Promise<PathEntries|null>;

  removeFile(
    name: string,
    type: entryType,
    ids: [number, number],
    extraPath: string[]
  ): Promise<boolean>;

  renameFile(
    newName: string,
    name: string,
    ids: [number, number],
    extraPath: string[]
  ): Promise<boolean>;

  readFile(
    name: string,
    type: entryType,
    ids: [number, number],
    extraPath: string[]
  ): Promise<string|null>;

  editFile(
    ids: [number, number],
    filePath: string[],
    src: string
  ): Promise<boolean>
}
