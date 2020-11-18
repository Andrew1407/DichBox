import { Request } from 'express';
import { makeTuple, formatDate, checkPathes } from '../extra';
import { statuses, errMessages } from '../statusInfo';
import { boxData, pathEntries, entryType } from '../../datatypes';
import BoxesDataConnector from '../../database/BoxesClientDB/BoxesDataConnector';
import BoxesStorageManager from '../../storageManagers/BoxesStorageManager';
import { boxesRouters } from '../routesTypes';

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
    return makeTuple(statuses.CREATED, { name: createdBox.name });
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
    return makeTuple(statuses.OK, { boxesList });
  },

  async verifyBoxName(req: Request) {
    const username: number = req.body.username;
    const boxName: string = req.body.boxName;
    const foundBox: boxData|null = await clientDB.findUserBox(username, boxName);
    const foundValue: string|null = foundBox ? foundBox.name : null;
    return makeTuple(statuses.OK, { foundValue });
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
      const msg: string = errMessages.BOXES_NOT_FOUND;
      return makeTuple(statuses.NOT_FOUND, { msg });
    }
    const logo: string|null =
      await boxesStorage.getLogoIfExists(boxInfo.id, boxInfo.owner_id);
    delete boxInfo.id;
    delete boxInfo.owner_id;
    formatDate(boxInfo);
    return makeTuple(statuses.OK, { ...boxInfo, logo });
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
      const msg: string = errMessages.BOXES_INVAID_REQUEST;
      return makeTuple(statuses.BAD_REQUEST, { msg });
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
    return makeTuple(statuses.OK, jsonRes);
  },

  async removeBox(req: Request) {
    const { confirmation, username, boxName, ownPage }: {
      confirmation: string,
      username: string,
      boxName: string,
      ownPage: boolean
    } = req.body;
    const msg: string = errMessages.FORBIDDEN;
    if (!ownPage && confirmation !== 'permitted')
      return makeTuple(statuses.FORBIDDEN, { msg });
    const ids: [number, number]|null =
      await clientDB.getUserBoxIds(username, boxName);
    if (!ids)
      return makeTuple(statuses.FORBIDDEN, { msg });
    await Promise.all([
      clientDB.removeBox(ids[1]),
      boxesStorage.removeBox(...ids)
    ]);
    return makeTuple(statuses.OK, { removed: true });
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
    const msg: string = errMessages.DIR_NOT_FOUND;
    if (!checkPathes([extraPath]))
      return makeTuple(statuses.NOT_FOUND, { msg });
    const checkup: [number, number]|null = await clientDB.checkBoxAccess(
      ownerName, viewerName, boxName, follower, editor
    );
    if (!checkup)
      return makeTuple(statuses.NOT_FOUND, { msg });
    const entries: pathEntries = 
      await boxesStorage.getPathEntries(checkup, initial, extraPath);
    return entries ?
      makeTuple(statuses.OK, { entries }) :
      makeTuple(statuses.NOT_FOUND, { msg });
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
    const [ ownerName, boxName, ...extraPath ]: string[] = boxPath;
    if (!checkPathes([extraPath])) {
      const msg: string = errMessages.INVALID_PATH;
      return makeTuple(statuses.NOT_FOUND, { msg });
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
    return makeTuple(statuses.CREATED, { created, last_edited: edited.last_edited });
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
    const msg: string = errMessages.INVALID_PATH;
    if (!checkPathes([extraPath]))
      return makeTuple(statuses.NOT_FOUND, { msg });
    const checkup: [number, number]|null = await clientDB.checkBoxAccess(
      ownerName, viewerName, boxName, follower, editor
    );
    if (!checkup)
      return makeTuple(statuses.NOT_FOUND, { msg });
    const foundData: string|null =
      await boxesStorage.readFile(name, type, checkup, extraPath);
    return makeTuple(statuses.OK, { foundData, found: true });
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
    const msg: string = errMessages.FORBIDDEN;
    if (!(files.length && editor))
      return makeTuple(statuses.FORBIDDEN, { msg });
    const editorId: number|null = await clientDB.getUserId(editorName);
    if (!editorId)
      return makeTuple(statuses.FORBIDDEN, { msg });
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
    if (!checkPathes(formatedPathes))
      return makeTuple(statuses.FORBIDDEN, { msg });
    const [ ownerName, boxName ]: string[] = filesFormated[0].filePath.slice(0, 2);
    const checkup: [number, number]|null = await clientDB.checkBoxAccess(
      ownerName, editorName, boxName, true, editor
    );
    if (!checkup)
      return makeTuple(statuses.FORBIDDEN, { msg });
    const filesWritted: boolean[] = await Promise.all(
      filesFormated.map(f => boxesStorage.editFile(
        checkup, f.filePath.slice(2), f.src
      ))
    );
    const edited: boolean = filesWritted.reduce(
      ((res, acc) => res && acc), true
    );
    if (!edited) {
      const msg: string = errMessages.BOXES_INTERNAL;
      return makeTuple(statuses.SERVER_INTERNAL, { msg });
    }
    const editedMark: boxData = await clientDB.updateBox(
      ownerName,
      boxName,
      { last_edited: 'now()' },
    );
    formatDate(editedMark);
    return makeTuple(statuses.OK, { edited, last_edited: editedMark.last_edited });
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
    const msg: string = errMessages.INVALID_PATH;
    if (!checkPathes([extraPath]))
      return makeTuple(statuses.NOT_FOUND, { msg });
    const checkup: [number, number]|null = await clientDB.checkBoxAccess(
      ownerName, viewerName, boxName, follower, editor
    );
    if (!checkup)
      return makeTuple(statuses.NOT_FOUND, { msg });
    const removed: boolean = 
      await boxesStorage.removeFile(fileName, type, checkup, extraPath);
    if (!removed) {
      const msg: string = errMessages.BOXES_INTERNAL;
      return makeTuple(statuses.SERVER_INTERNAL, { msg });
    }
    const edited: boxData = await clientDB.updateBox(
      ownerName,
      boxName,
      { last_edited: 'now()' },
    );
    formatDate(edited);
    return makeTuple(statuses.OK, { removed, last_edited: edited.last_edited });
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
    const msg: string = errMessages.FILES_NOT_FOUND;
    if (!checkPathes([extraPath]))
      return makeTuple(statuses.NOT_FOUND, { msg });
    const checkup: [number, number]|null = await clientDB.checkBoxAccess(
      ownerName, viewerName, boxName, follower, editor
    );
    if (!checkup)
      return makeTuple(statuses.NOT_FOUND, { msg });
    const edited: boxData = await clientDB.updateBox(
      ownerName,
      boxName,
      { last_edited: 'now()' },
    );
    formatDate(edited);
    const renamed: boolean = 
      await boxesStorage.renameFile(newName, fileName, checkup, extraPath);
    return makeTuple(statuses.OK, { renamed, last_edited: edited.last_edited });
  }

};

export default boxesController;
