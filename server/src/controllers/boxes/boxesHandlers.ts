import { Request } from 'express';
import { makeTuple, checkPathes } from '../extra';
import { formatDateTime } from '../dateFormatters';
import { Statuses, ErrorMessages } from '../statusInfo';
import { BoxData, PathEntries, entryType } from '../../datatypes';
import IBoxesStorageManager from '../../storageManagers/boxes/IBoxesStorageManager';
import { BoxesRoutes } from '../routesTypes';
import IBoxesClientDB from '../../database/BoxesClientDB/IBoxesClientDB';
import BoxesControllerFactory from '../controllersFactory/BoxesControllerFactory';
import IControllerFactory from '../controllersFactory/IControllerFactory';

type fileRequest = {
  boxPath: string[]
  viewerName: string,
  fileName: string,
  type: entryType,
  src?: string
};

const boxesFactory: IControllerFactory = new BoxesControllerFactory();
const clientDB: IBoxesClientDB = boxesFactory.getConnector() as IBoxesClientDB;
const boxesStorage: IBoxesStorageManager = boxesFactory.getStorageManager() as IBoxesStorageManager;

const formatDateAll = (obj: BoxData): void => {
  for (const key in obj) {
    const isDateField: RegExp = /^(reg_date|last_edited)$/;
    if (isDateField.test(key))
      obj[key] = formatDateTime(obj[key]);
  }
};

const boxesHandlers: BoxesRoutes = {
  async createBox(req: Request) {
    const { boxData, logo, limitedUsers, editors, username }: {
      boxData: BoxData,
      logo: string|null,
      limitedUsers: string[]|null,
      editors: string[]|null,
      username: string
    } = req.body;
    const createdBox: BoxData = await clientDB.insertBox(
      username, boxData, limitedUsers, editors
    );
    await boxesStorage.createBox(
      createdBox.owner_id,
      createdBox.id,
      logo
    );
    return makeTuple(Statuses.CREATED, { name: createdBox.name });
  },

  async findUserBoxes(req: Request) {
    const viewer: string|null = req.body.viewerName || null;
    const boxOwner: string = req.body.boxOwnerName;
    if (!boxOwner) {
      const msg: string = ErrorMessages.BOXES_INVAID_REQUEST;
      return makeTuple(Statuses.BAD_REQUEST, { msg });
    }
    const boxesList: BoxData[]|null = await clientDB.getBoxesList(viewer, boxOwner);
    return makeTuple(Statuses.OK, { boxesList });
  },

  async verifyBoxName(req: Request) {
    const username: string = req.body.username;
    const boxName: string = req.body.boxName;
    const foundBox: BoxData|null = await clientDB.findUserBox(username, boxName);
    const foundValue: string|null = foundBox ? foundBox.name : null;
    return makeTuple(Statuses.OK, { foundValue });
  },

  async getBoxDetais(req: Request) {
    const { ownerName, viewerName, boxName }: {
      ownerName: string,
      viewerName: string|null,
      boxName: string
    } = req.body;
    const boxInfo: BoxData|null =
      await clientDB.getBoxInfo(boxName, viewerName, ownerName);
    if (!boxInfo) {
      const msg: string = ErrorMessages.BOXES_NOT_FOUND;
      return makeTuple(Statuses.NOT_FOUND, { msg });
    }
    const logo: string|null =
      await boxesStorage.getLogoIfExists(boxInfo.id, boxInfo.owner_id);
    delete boxInfo.id;
    delete boxInfo.owner_id;
    formatDateAll(boxInfo);
    return makeTuple(Statuses.OK, { ...boxInfo, logo });
  },

  async editBox(req: Request) {
    const username: string = req.body.username;
    const logo: string|null = req.body.logo || null;
    const limitedList: string[]|null = req.body.limitedUsers || null;
    const editorsList: string[]|null = req.body.editors || null;
    const boxData: BoxData|null = req.body.boxData || null;
    const boxName: string = req.body.boxName;
    const updated: BoxData|null = await clientDB.updateBox(
      username, boxName, boxData, limitedList, editorsList
    );
    if (!updated) {
      const msg: string = ErrorMessages.BOXES_INVAID_REQUEST;
      return makeTuple(Statuses.BAD_REQUEST, { msg });
    }
    if (logo) await (logo === 'removed') ?
      boxesStorage.removeLogoIfExists(updated.id, updated.owner_id) :
      boxesStorage.saveLogo(logo, updated.id, updated.owner_id);
    delete updated.id;
    delete updated.owner_id;
    formatDateAll(updated);
    const jsonRes: BoxData & { logo?: string } = 
      !logo || logo === 'removed' ?
        updated : { ...updated, logo };
    return makeTuple(Statuses.OK, jsonRes);
  },

  async removeBox(req: Request) {
    const { confirmation, username, boxName, ownPage }: {
      confirmation: string,
      username: string,
      boxName: string,
      ownPage: boolean
    } = req.body;
    const msg: string = ErrorMessages.FORBIDDEN;
    if (!ownPage || confirmation !== 'permitted')
      return makeTuple(Statuses.FORBIDDEN, { msg });
    const ids: [number, number]|null =
      await clientDB.getUserBoxIds(username, boxName);
    if (!ids)
      return makeTuple(Statuses.FORBIDDEN, { msg });
    await Promise.all([
      clientDB.removeBox(ids[1]),
      boxesStorage.removeBox(...ids)
    ]);
    return makeTuple(Statuses.OK, { removed: true });
  },

  async getPathFiles(req: Request) {
    const boxPath: string[] = req.body.boxPath;
    const viewerName: string|null = req.body.viewerName || null;
    const initial: boolean = req.body.initial;
    const [ ownerName, boxName, ...extraPath ]: string[] = boxPath;
    const msg: string = ErrorMessages.DIR_NOT_FOUND;
    if (!checkPathes([extraPath]))
      return makeTuple(Statuses.NOT_FOUND, { msg });
    const checkup: [number, number]|null =
      await clientDB.checkBoxAccess(ownerName, viewerName, boxName);
    if (!checkup)
      return makeTuple(Statuses.NOT_FOUND, { msg });
    const entries: PathEntries = 
      await boxesStorage.getPathEntries(checkup, initial, extraPath);
    return entries ?
      makeTuple(Statuses.OK, { entries }) :
      makeTuple(Statuses.NOT_FOUND, { msg });
  },

  async createFile(req: Request) {
    const { boxPath, viewerName, fileName, type, src }: fileRequest = req.body;
    const [ ownerName, boxName, ...extraPath ]: string[] = boxPath;
    if (!checkPathes([extraPath])) {
      const msg: string = ErrorMessages.INVALID_PATH;
      return makeTuple(Statuses.NOT_FOUND, { msg });
    }
    const checkup: [number, number]|null =
      await clientDB.checkBoxAccess(ownerName, viewerName, boxName);
    const edited: BoxData = await clientDB.updateBox(
      ownerName,
      boxName,
      { last_edited: 'now()' },
    );
    formatDateAll(edited);
    const created: PathEntries = 
      await boxesStorage.addFile(fileName, type, checkup, extraPath, src);
    return makeTuple(Statuses.CREATED, { created, last_edited: edited.last_edited });
  },

  async getFile(req: Request) {
    const { boxPath, viewerName, fileName, type }: fileRequest = req.body;
    const [ ownerName, boxName, ...extraPath ]: string[] = boxPath;
    const msg: string = ErrorMessages.INVALID_PATH;
    if (!checkPathes([extraPath]))
      return makeTuple(Statuses.NOT_FOUND, { msg });
    const checkup: [number, number]|null =
      await clientDB.checkBoxAccess(ownerName, viewerName, boxName);
    if (!checkup)
      return makeTuple(Statuses.NOT_FOUND, { msg });
    const foundData: string|null =
      await boxesStorage.readFile(fileName, type, checkup, extraPath);
    return foundData === null ?
      makeTuple(Statuses.NOT_FOUND, { msg }) : 
      makeTuple(Statuses.OK, { foundData, found: true });
  },

  async saveFiles(req: Request) {
    const { editorName, files }: {
      editorName: string,
      files: {
        src: string,
        filePathStr: string
      }[]
    } = req.body;
    if (!files.length)
      return makeTuple(Statuses.FORBIDDEN, { msg: ErrorMessages.BOXES_INVAID_REQUEST });
    const editorId: number|null = await clientDB.getUserId(editorName);
    if (!editorId)
      return makeTuple(Statuses.FORBIDDEN, { msg: ErrorMessages.FORBIDDEN });
    const filesFormated: {
      src: string,
      filePath: string[]
    }[] = files.map(f => ({
      src: f.src,
      filePath: f.filePathStr.split('/').splice(1)
    }));
    const formatedPathes: string[][] = filesFormated.map(f => f.filePath);
    const msgForbidden: string = ErrorMessages.FORBIDDEN;
    if (!checkPathes(formatedPathes))
      return makeTuple(Statuses.FORBIDDEN, { msg: msgForbidden });
    const [ ownerName, boxName ]: string[] = filesFormated[0].filePath;
    const checkup: [number, number]|null =
      await clientDB.checkBoxAccess(ownerName, editorName, boxName);
    if (!checkup)
      return makeTuple(Statuses.FORBIDDEN, { msg: msgForbidden });
    const filesWritten: boolean[] = await Promise.all(
      filesFormated.map(f => boxesStorage.editFile(
        checkup, f.filePath.slice(2), f.src
      ))
    );
    const editedReducer = (res: boolean, acc: boolean): boolean => res && acc;
    const edited: boolean = filesWritten.reduce(editedReducer, true);
    if (!edited) {
      const msg: string = ErrorMessages.BOXES_INTERNAL;
      return makeTuple(Statuses.SERVER_INTERNAL, { msg });
    }
    const editedMark: BoxData = await clientDB.updateBox(
      ownerName,
      boxName,
      { last_edited: 'now()' }
    );
    formatDateAll(editedMark);
    return makeTuple(Statuses.OK, { edited, last_edited: editedMark.last_edited });
  },

  async removeFile(req: Request) {
    const { boxPath, viewerName, fileName, type }: fileRequest = req.body;
    const [ ownerName, boxName, ...extraPath ]: string[] = boxPath;
    const msg: string = ErrorMessages.INVALID_PATH;
    if (!checkPathes([extraPath]))
      return makeTuple(Statuses.NOT_FOUND, { msg });
    const checkup: [number, number]|null =
      await clientDB.checkBoxAccess(ownerName, viewerName, boxName);
    if (!checkup)
      return makeTuple(Statuses.NOT_FOUND, { msg });
    const removed: boolean = 
      await boxesStorage.removeFile(fileName, type, checkup, extraPath);
    if (!removed) {
      const msg: string = ErrorMessages.BOXES_INTERNAL;
      return makeTuple(Statuses.SERVER_INTERNAL, { msg });
    }
    const edited: BoxData = await clientDB.updateBox(
      ownerName,
      boxName,
      { last_edited: 'now()' }
    );
    formatDateAll(edited);
    return makeTuple(Statuses.OK, { removed, last_edited: edited.last_edited });
  },

  async renameFile(req: Request) {
    const { boxPath, viewerName, fileName, newName }: {
      boxPath: string[]
      viewerName: string,
      fileName: string,
      newName: string
    } = req.body;
    const [ ownerName, boxName, ...extraPath ]: string[] = boxPath;
    const msg: string = ErrorMessages.FILES_NOT_FOUND;
    if (!checkPathes([extraPath]))
      return makeTuple(Statuses.NOT_FOUND, { msg });
    const checkup: [number, number]|null =
      await clientDB.checkBoxAccess(ownerName, viewerName, boxName);
    if (!checkup)
      return makeTuple(Statuses.NOT_FOUND, { msg });
    const edited: BoxData = await clientDB.updateBox(
      ownerName,
      boxName,
      { last_edited: 'now()' }
    );
    formatDateAll(edited);
    const renamed: boolean = 
      await boxesStorage.renameFile(newName, fileName, checkup, extraPath);
    return makeTuple(Statuses.OK, { renamed, last_edited: edited.last_edited });
  }
};

export default boxesHandlers;
