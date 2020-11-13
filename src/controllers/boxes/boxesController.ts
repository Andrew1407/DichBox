import { Request } from 'express';
import { boxData, pathEntries, entryType } from '../../datatypes';
import { makeTuple, boxesRouters, formatDate, checkPathes } from '../extra';
import BoxesDataConnector from '../../database/BoxesClientDB/BoxesDataConnector';
import BoxesStorageManager from '../../storageManagers/BoxesStorageManager';

const boxesStorage: BoxesStorageManager = new BoxesStorageManager();
const clientDB: BoxesDataConnector = new BoxesDataConnector();
clientDB.clientConnection();

const boxesController: boxesRouters = {
  async createBox(req: Request) {
    const { boxData, logo, limitedUsers, editors, username }: {
      boxData: boxData,
      logo: string|null,
      limitedUsers: string[]|null,
      editors: string[]|null,
      username: string
    } = req.body;
    const createdBox: boxData = await clientDB.insertBox(
      username, boxData, limitedUsers, editors
    );
    await boxesStorage.createBox(
      createdBox.owner_id,
      createdBox.id,
      logo
    );
    return makeTuple(201, { name: createdBox.name });
  },

  async findUserBoxes(req: Request) {
    const { viewerName,  boxOwnerName, follower }: {
      viewerName: string,
      boxOwnerName: string,
      follower: boolean
    } = req.body;
    const boxesList: boxData[]|null = await clientDB.getBoxesList(
      viewerName, boxOwnerName, follower
    );
    return makeTuple(200, { boxesList });
  },

  async verifyBoxName(req: Request) {
    const username: number = req.body.username;
    const boxName: string = req.body.boxName;
    const foundBox: boxData|null = await clientDB.findUserBox(username, boxName);
    const foundValue: string|null = foundBox ? foundBox.name : null;
    return makeTuple(200, { foundValue });
  },

  async getBoxDetais(req: Request) {
    const { follower, ownerName, viewerName, boxName }: {
      follower: boolean,
      ownerName: string,
      viewerName: string,
      boxName: string
    } = req.body;
    const boxInfo: boxData|null = await clientDB.getBoxInfo(
      boxName, viewerName, ownerName, follower
    );
    if (!boxInfo) {
      const msg: string = 'No box, no files, no directories... Nothing... Just nothing...';
      return makeTuple(404, { msg });
    }
    const logo: string|null =
      await boxesStorage.getLogoIfExists(boxInfo.id, boxInfo.owner_id);
    delete boxInfo.id;
    delete boxInfo.owner_id;
    formatDate(boxInfo);
    return makeTuple(200, { ...boxInfo, logo });
  },

  async editBox(req: Request) {
    const username: string = req.body.username;
    const logo: string|null = req.body.logo;
    const limitedList: string[]|null = req.body.limitedUsers;
    const editorsList: string[]|null = req.body.editors;
    const boxData: boxData|null = req.body.boxData;
    const boxName: string = req.body.boxName;
    const updated: boxData|null = await clientDB.updateBox(
      username, boxName, boxData, limitedList, editorsList
    );
    if (!updated) {
      const msg: string = 'Well, invald data...';
      return makeTuple(400, { msg });
    }
    if (logo) await (logo === 'removed') ?
      boxesStorage.removeLogoIfExists(updated.id, updated.owner_id) :
      boxesStorage.saveLogo(logo, updated.id, updated.owner_id);
    delete updated.id;
    delete updated.owner_id;
    formatDate(updated)
    const jsonRes: boxData & { logo?: string } = 
      !logo || logo === 'removed' ?
        updated : { ...updated, logo };
    return makeTuple(200, jsonRes);
  },

  async removeBox(req: Request) {
    const { confirmation, username, boxName, ownPage }: {
      confirmation: string,
      username: string,
      boxName: string,
      ownPage: boolean
    } = req.body;
    if (!ownPage && confirmation !== 'permitted') {
      const msg: string = 'Forbidden for you!!!';
      return makeTuple(403, { msg });
    }
    const ids: [number, number]|null =
      await clientDB.getUserBoxIds(username, boxName);
    if (!ids)  {
      const msg: string = 'Forbidden for you!!!';
      return makeTuple(403, { msg });
    }
    await Promise.all([
      clientDB.removeBox(ids[1]),
      boxesStorage.removeBox(...ids)
    ]);
    return makeTuple(200, { removed: true });
  },

  async getPathFiles(req: Request) {
    const { boxPath, viewerName, follower, initial, editor }: {
      boxPath: string[]
      viewerName: string,
      follower: boolean,
      initial: boolean,
      editor: boolean
    } = req.body;
    const [ ownerName, boxName ]: string[] = boxPath.slice(0, 2);
    const extraPath: string[] = boxPath.slice(2);
    const msg: string = 'Nothing is here. No fies, no directories...';
    if (!checkPathes([extraPath]))
      return makeTuple(404, { msg });
    const checkup: [number, number]|null = await clientDB.checkBoxAccess(
      ownerName, viewerName, boxName, follower, editor
    );
    if (!checkup) return makeTuple(404, { msg });
    const entries: pathEntries = 
      await boxesStorage.getPathEntries(checkup, initial, extraPath);
    return entries ?
      makeTuple(200, { entries }) :
      makeTuple(404, { msg });
  },

  async createFile(req: Request) {
    const { boxPath, viewerName, follower, fileName, type, editor, src }: {
      boxPath: string[]
      viewerName: string,
      follower: boolean,
      fileName: string,
      editor: boolean,
      type: entryType,
      src?: string
    } = req.body;
    const [ ownerName, boxName ]: string[] = boxPath.slice(0, 2);
    const extraPath: string[] = boxPath.slice(2);
    if (!checkPathes([extraPath])) {
      const msg: string = 'This path has led you to nowhere...';
      return makeTuple(404, { msg });
    }
    const checkup: [number, number]|null = await clientDB.checkBoxAccess(
      ownerName, viewerName, boxName, follower, editor
    );
    const edited: boxData = await clientDB.updateBox(
      ownerName,
      boxName,
      { last_edited: 'now()' },
    );
    formatDate(edited);
    const created: pathEntries = 
      await boxesStorage.addFile(fileName, type, checkup, extraPath, src);
    return makeTuple(201, { created, last_edited: edited.last_edited });
  },

  async getFile(req: Request) {
    const { boxPath, viewerName, follower, name, type, editor }: {
      boxPath: string[]
      viewerName: string,
      follower: boolean,
      name: string,
      editor: boolean,
      type: entryType
    } = req.body;
    const [ ownerName, boxName ]: string[] = boxPath.slice(0, 2);
    const extraPath: string[] = boxPath.slice(2);
    if (!checkPathes([extraPath])) {
      const msg: string = 'This path has led you to nowhere...';
      return makeTuple(404, { msg });
    }
    const checkup: [number, number]|null = await clientDB.checkBoxAccess(
      ownerName, viewerName, boxName, follower, editor
    );
    if (!checkup) return makeTuple(404, {});
    const foundData: string|null =
      await boxesStorage.readFile(name, type, checkup, extraPath);
    return makeTuple(200, { foundData, found: true });
  },

  async saveFiles(req: Request) {
    const { editor, editorName, files }: {
      editorName: string,
      editor: boolean,
      files: {
        src: string,
        filePathStr: string
      }[]
    } = req.body;
    if (!(files.length && editor)) {
      const msg: string = 'Forbidden for you!!!';
      return makeTuple(403, { msg });
    }
    const editorId: number|null = await clientDB.getUserId(editorName);
    if (!editorId) return makeTuple(403, {});
    const filesFormated: {
      src: string,
      filePath: string[]
    }[] = files.map(f => ({
      src: f.src,
      filePath: f.filePathStr
        .split('/')
        .splice(1)
    }));
    const formatedPathes: string[][] = filesFormated.map(f => f.filePath);
    if (!checkPathes(formatedPathes)) {
      const msg: string = 'This path has led you to nowhere...';
      return makeTuple(404, { msg });
    }
    const [ ownerName, boxName ]: string[] = filesFormated[0].filePath.slice(0, 2);
    const checkup: [number, number]|null = await clientDB.checkBoxAccess(
      ownerName, editorName, boxName, true, editor
    );
    if (!checkup) {
      const msg: string = 'Forbidden for you!!!';
      return makeTuple(403, { msg });
    }
    const filesWritted: boolean[] = await Promise.all(
      filesFormated.map(f => boxesStorage.editFile(
        checkup, f.filePath.slice(2), f.src
      ))
    );
    const edited: boolean = filesWritted.reduce(
      ((res, acc) => res && acc), true
    );
    if (!edited) {
      const msg: string = 'Very big problems with DichBox server.';
      return makeTuple(500, { msg });
    }
    const editedMark: boxData = await clientDB.updateBox(
      ownerName,
      boxName,
      { last_edited: 'now()' },
    );
    formatDate(editedMark);
    return makeTuple(200, { edited, last_edited: editedMark.last_edited });
  },

  async removeFile(req: Request) {
    const { boxPath, viewerName, follower, fileName, editor, type }: {
      boxPath: string[]
      viewerName: string,
      follower: boolean,
      fileName: string,
      editor: boolean,
      type: entryType
    } = req.body;
    const [ ownerName, boxName ]: string[] = boxPath.slice(0, 2);
    const extraPath: string[] = boxPath.slice(2);
    if (!checkPathes([extraPath])) {
      const msg: string = 'This path has led you to nowhere...';
      return makeTuple(404, { msg });
    }
    const checkup: [number, number]|null = await clientDB.checkBoxAccess(
      ownerName, viewerName, boxName, follower, editor
    );
    if (!checkup) {
      const msg: string = 'Wrong names, no data for you...';
      return makeTuple(404, { msg });
    }
    const removed: boolean = 
      await boxesStorage.removeFile(fileName, type, checkup, extraPath);
    if (!removed) {
      const msg: string = 'Very big problems with DichBox server.';
      return makeTuple(500, { msg });
    }
    const edited: boxData = await clientDB.updateBox(
      ownerName,
      boxName,
      { last_edited: 'now()' },
    );
    formatDate(edited);
    return makeTuple(200, { removed, last_edited: edited.last_edited });
  },

  async renameFile(req: Request) {
    const { boxPath, viewerName, follower, fileName, editor, newName }: {
      boxPath: string[]
      viewerName: string,
      follower: boolean,
      fileName: string,
      newName: string,
      editor: boolean
    } = req.body;
    const [ ownerName, boxName ]: string[] = boxPath.slice(0, 2);
    const extraPath: string[] = boxPath.slice(2);
    if (!checkPathes([extraPath])) {
      const msg: string = 'Wrong names, no data for you...';
      return makeTuple(404, { msg });
    }
    const checkup: [number, number]|null = await clientDB.checkBoxAccess(
      ownerName, viewerName, boxName, follower, editor
    );
    if (!checkup) {
      const msg: string = 'Wrong names, no data for you...';
      return makeTuple(404, { msg });
    }
    const edited: boxData = await clientDB.updateBox(
      ownerName,
      boxName,
      { last_edited: 'now()' },
    );
    formatDate(edited);
    const renamed: boolean = 
      await boxesStorage.renameFile(newName, fileName, checkup, extraPath);
    return makeTuple(200, { renamed, last_edited: edited.last_edited });
  }

};

export default boxesController;
