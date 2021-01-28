import TestLogger from '../../TestLogger';
import ITester from '../../ITester';
import IBoxesStorageManager from '../../../storageManagers/boxes/IBoxesStorageManager';
import BoxesStorageManager from '../../../storageManagers/boxes/BoxesStorageManager';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';
import { DirEntries, entryType, PathEntries } from '../../../datatypes';

dotenv.config();

export default class BoxesSMTest extends TestLogger implements ITester {
  private readonly boxesStorageManager: IBoxesStorageManager;
  private readonly boxesPath: string;

  constructor() {
    super();
    this.boxesStorageManager = new BoxesStorageManager();
    const storagePath = process.env.STORAGE_PATH || '../../DichStorage';
    this.boxesPath = path.join(storagePath, 'boxes');
  }

  public async test(): Promise<void> {
    await this.testCreateBox();
    await this.testPathEntries();
    await this.testRenameFile();
    await this.testFiles();
    await this.testRemoveBox();
  }

  public async run(): Promise<void> {
    const testName: string = 'Boxes storage manager test';
    this.logAndCheck(testName);
  }

  private async testCreateBox(): Promise<void> {
    const id = 0;
    const errMsg: string = `FAILED. Unexpected behavior while creating box`;
    await this.boxesStorageManager.createBox(id, id, null);
    const boxPath: string = this.getBoxPath(id, id);
    await this.checkFileAndType(boxPath, 'dir', errMsg);
  }

  private async testPathEntries(): Promise<void> {
    const ids: [number, number] = [0, 0];
    const sourcePath: string = '../client/src/styles/imgs/dich-icon.png';
    const boxPath: string = this.getBoxPath(...ids);
    const errMsg: string = `FAILED. Unexpected behavior while adding files`;
    const img: string = await fs.promises.readFile(sourcePath, 'base64');
    const createArgs: 
      [string, entryType, [number, number], string[], string][] = [
        ['testDir', 'dir', ids, [], null],
        ['testFile.txt', 'file', ids, ['testDir'], null],
        ['testImg.png', 'image', ids, ['testDir'], img]
    ];
    const pathEntriesArgs: [[number, number], boolean, string[]][] = [
        [ids, false, []],
        [ids, false, ['testDir']],
        [ids, false, ['testDir']]
    ];
    const expected: any[] = [
      {
        type: createArgs[0][1], dir: {
          src: [ { name: createArgs[0][0], type: createArgs[0][1] } ],
          name: createArgs[0][0]
        }
      },
      {
        type: createArgs[1][1], file: {
          src: [ { name: createArgs[1][0], type: createArgs[1][1] } ],
          name: createArgs[1][0]
        }
      },
      {
        type: createArgs[2][1], file: {
          src: [
            { name: createArgs[1][0], type: createArgs[1][1] },
            { name: createArgs[2][0], type: createArgs[2][1] }
          ],
          name: createArgs[2][0]
        }
      }
    ];

    for (const i in createArgs) {
      const arg: [
        string,
        entryType,
        [number, number],
        string[],
        string
      ] = createArgs[i];
      const createExp: PathEntries = expected[i];
      const type: entryType = createExp.type;
      const name: string = arg[0];
      const filePath: string = arg[3].length ?
        path.join(boxPath, arg[3][0], name) :
        path.join(boxPath, name);
      const createRes = await this.boxesStorageManager
        .addFile(...arg);
      this.equals(createRes, createExp);
      this.checkFileAndType(filePath, type, errMsg);

      const pathEntriesArg:
        [[number, number], boolean, string[]] = pathEntriesArgs[i];
      const src: string|DirEntries[] = (createRes.type === 'image') ?
        createRes['file'].src :
        createRes[createRes.type].src;
      const pathEntriesExp: any = {
        dir: { src, name: 'хрін тобі' },
        type: 'dir'
      };
      const pathEntriesRes: PathEntries = await this.boxesStorageManager
        .getPathEntries(...pathEntriesArg);
      this.equals(pathEntriesRes, pathEntriesExp);
    }
  }

  private async testRemoveBox(): Promise<void> {
    const ids: [number, number] = [0, 0];
    const errMsg: string = `FAILED. Unexpected behavior while deleting box`;
    await this.boxesStorageManager.removeBox(...ids);
    const boxPath: string = this.getBoxPath(...ids);
    const boxExists: boolean = fs.existsSync(boxPath);
    !boxExists ? this.addTestResult(null) :
      this.addTestResult(new Error(errMsg));
    const userDirPath: string = path.join(
      this.boxesPath,
      ids[0].toString()
    );
    await fs.promises.rmdir(userDirPath, { recursive: true });
  }

  private async testRenameFile(): Promise<void> {
    const oldName: string = 'testFile.txt';
    const newName: string = 'editedFile.txt';
    const ids: [number, number] = [0, 0];
    const extraPath: string = 'testDir';
    await this.boxesStorageManager
      .renameFile(newName, oldName, ids, [extraPath]);
    const boxPath: string = this.getBoxPath(...ids);
    const filePath: string = path.join(boxPath, extraPath, newName);
    const errMsg: string = `FAILED. Unexpected behavior while renaming file`;
    this.checkFileAndType(filePath, 'file', errMsg);
  }

  private async testFiles(): Promise<void> {
    const ids: [number, number] = [0, 0];
    const text: string = 'sample file content';
    const filename: string = 'editedFile.txt'; 
    const dir: string = 'testDir';
    const boxPath: string = this.getBoxPath(...ids);
    const filePath: string = path.join(boxPath, dir, filename);
    await this.boxesStorageManager.editFile(ids, [dir, filename], text);
    const editRes: string = await fs.promises.readFile(filePath, 'utf-8');
    this.equals(editRes, text);
    
    const imgSrc: string = '../client/src/styles/imgs/dich-icon.png';
    const img: string = await fs.promises.readFile(imgSrc, 'base64');
    const imgName: string = 'testImg.png';
    const args: any = {
      [filename]: ['file', text],
      [imgName]: ['image', img],
      ['']: ['dir', null]
    };
    const errMsg: string = `FAILED. Unexpected behavior while deleting file`;
    for (let [name, value] of Object.entries(args)) {
      const type: entryType = value[0];
      const arg: [string, entryType, [number, number], string[]] =
        [name, type, ids, [dir]];
      const res = await this.boxesStorageManager.readFile(...arg);
      this.equals(res, value[1]);

      const filePath: string = path.join(boxPath, dir, name);
      await this.boxesStorageManager.removeFile(...arg);
      const exists: boolean = fs.existsSync(filePath);
      !exists ? this.addTestResult(null) :
        this.addTestResult(new Error(errMsg));
    }
  }

  private getBoxPath(idUser: number, idBox: number): string {
    const [user, box]: string[] = [idUser, idBox].map(
      ((x: number): string => x.toString())
    );
    return path.join(this.boxesPath, user, box);
  }

  private async checkFileAndType(
    path: string,
    type: entryType,
    msg: string
    ): Promise<void> {
    const exists: boolean = fs.existsSync(path);
    const stat: fs.Stats = await fs.promises.lstat(path);
    const correctType: boolean = (type === 'dir') ?
      await stat.isDirectory() :
      await stat.isFile();
    (exists && correctType) ? this.addTestResult(null) :
      this.addTestResult(new Error(msg));
  }

  private equals(result: any, expected: any): void {
    const res: string = JSON.stringify(result);
    const exp: string = JSON.stringify(expected);
    const errorMsg: string = `FAILED. Incorrect result - expected:\n"${exp}",\ngot:\n"${res}"`;
    return (res === exp) ? this.addTestResult(null) :
      this.addTestResult(new Error(errorMsg));
  }
}
