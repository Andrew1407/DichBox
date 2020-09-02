import { Request, Response } from 'express';
import { boxData, pathEntries, entryType } from '../datatypes';
import BoxesClientDichBoxDB from '../database/BoxesClientDichBoxDB';
import BoxesStorageManager from '../storageManagers/BoxesStorageManager';

type middlewareFn = (req: Request, res: Response) => Promise<void>;
type boxListRequest = {
  viewerName: string,
  boxOwnerName: string,
  follower: boolean
};

const boxesStorage: BoxesStorageManager = new BoxesStorageManager();
const clientDB: BoxesClientDichBoxDB = new BoxesClientDichBoxDB();
clientDB.clientConnection();

const formatDate = (obj: any): void => {
  for (const key in obj)
    if (/^(reg_date|last_edited)$/.test(key))
      obj[key] = new Date(obj[key])
        .toLocaleString()
        .replace(/\//g, '.');
};

const createBox: middlewareFn = async (req: Request, res: Response) => {
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
  res.json({ name: createdBox.name }).end();
  res.end();
};

const findUserBoxes: middlewareFn = async (req: Request, res: Response) => {
  const { viewerName,  boxOwnerName, follower }: boxListRequest = req.body;
  const boxesList: boxData[]|null = await clientDB.getBoxesList(
    viewerName, boxOwnerName, follower
  );
  res.json({ boxesList }).end();
};

const verifyBoxName: middlewareFn = async (req: Request, res: Response) => {
  const user_id: number = req.body.id;
  const boxName: string = req.body.boxName;
  const foundBox: boxData|null = await clientDB.findUserBox(user_id, boxName);
  const foundValue: string|null = foundBox ?
    foundBox.name : null;
  res.json({ foundValue }).end();
};

const getBoxDetais: middlewareFn = async (req: Request, res: Response) => {
  const follower: boolean = req.body.follower;
  const ownerName: string = req.body.ownerName;
  const viewerName: string = req.body.viewerName;
  const boxName: string = req.body.boxName;
  const boxInfo: boxData|null = await clientDB.getBoxInfo(
    boxName, viewerName, ownerName, follower
  );
  if (!boxInfo) {
    res.json({}).end();
    return;
  }
  const logo: string|null =
    await boxesStorage.getLogoIfExists(boxInfo.id, boxInfo.owner_id);
  delete boxInfo.id;
  delete boxInfo.owner_id;
  formatDate(boxInfo);
  res.json({ ...boxInfo, logo }).end();
};

const editBox: middlewareFn = async (req: Request, res: Response) => {
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
    res.json({}).end();
    return;
  }
  if (logo) await (logo === 'removed') ?
    boxesStorage.removeLogoIfExists(updated.id, updated.owner_id) :
    boxesStorage.saveLogo(logo, updated.id, updated.owner_id);
  delete updated.id;
  delete updated.owner_id;
  formatDate(updated)
  const jsonRes: boxData & { logo?: string } = 
    !logo || logo === 'removed' ?
      updated : { ...updated, logo } ;
  res.json(jsonRes).end();
};

const removeBox: middlewareFn = async (req: Request, res: Response) => {
  const { confirmation, username, boxName, ownPage }: {
    confirmation: string,
    username: string,
    boxName: string,
    ownPage: boolean
  } = req.body;
  if (!ownPage && confirmation !== 'permitted') {
    res.json({ removed: true }).end();
    return;
  }
  const ids: [number, number]|null =
    await clientDB.getUserBoxIds(username, boxName);
  if (!ids) {
    res.json({ removed: true }).end();
    return;
  }
  await Promise.all([
    clientDB.removeBox(ids[1]),
    boxesStorage.removeBox(...ids)
  ]);
  res.json({ removed: true }).end();
};

const getPathFiles: middlewareFn = async (req: Request, res: Response) => {
  const { boxPath, viewerName, follower, initial, editor }: {
    boxPath: string[]
    viewerName: string,
    follower: boolean,
    initial: boolean,
    editor: boolean
  } = req.body;
  const [ ownerName, boxName ]: string[] = boxPath.slice(0, 2);
  const extraPath: string[] = boxPath.slice(2);
  const checkup: [number, number]|null = await clientDB.checkBoxAccess(
    ownerName, viewerName, boxName, follower, editor
  );
  if (!checkup) { 
    res.json({ entries: null }).end();
    return;
  }
  const entries: pathEntries = 
    await boxesStorage.getPathEntries(checkup, initial, extraPath);
  res.json({ entries }).end();
};

const createFile: middlewareFn = async (req: Request, res: Response) => {
  const { boxPath, viewerName, follower, fileName, type, editor }: {
    boxPath: string[]
    viewerName: string,
    follower: boolean,
    fileName: string,
    editor: boolean,
    type: entryType
  } = req.body;
  const [ ownerName, boxName ]: string[] = boxPath.slice(0, 2);
  const extraPath: string[] = boxPath.slice(2);
  const checkup: [number, number]|null = await clientDB.checkBoxAccess(
    ownerName, viewerName, boxName, follower, editor
  );
  if (!checkup) { 
    res.json({}).end();
    return;
  }
  const edited: boxData = await clientDB.updateBox(
    ownerName,
    boxName,
    { last_edited: 'now()' },
  );
  formatDate(edited);
  const created: pathEntries = 
    await boxesStorage.addFile(fileName, type, checkup, extraPath);
  res.json({ created, last_edited: edited.last_edited }).end();
};

const getFile: middlewareFn = async (req: Request, res: Response) => {
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
  const checkup: [number, number]|null = await clientDB.checkBoxAccess(
    ownerName, viewerName, boxName, follower, editor
  );
  if (!checkup) { 
    res.json({ foundData: null }).end();
    return;
  }
  const foundData: string|null =
    await boxesStorage.readFile(name, type, checkup, extraPath);
  res.json({ foundData, found: true }).end();
};

const saveFile: middlewareFn = async (req: Request, res: Response) => {
  const { editor, editorName, files }: {
    editorName: string,
    editor: boolean,
    files: {
      src: string,
      filePathStr: string
    }[]
  } = req.body;
  if (!(files.length && editor)) {
    res.json({}).end();
    return;
  }
  const editorId: number|null = await clientDB.getUserId(editorName);
  if (!editorId) {
    res.json({}).end();
    return;
  }
  const filesFormated: {
    src: string,
    filePath: string[]
  }[] = files.map(f => ({
    src: f.src,
    filePath: f.filePathStr
      .split('/')
      .splice(1)
  }));
  const [ ownerName, boxName ]: string[] = filesFormated[0].filePath.slice(0, 2);
  const checkup: [number, number]|null = await clientDB.checkBoxAccess(
    ownerName, editorName, boxName, true, editor
  );
  if (!checkup) { 
    res.json({}).end();
    return;
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
    res.json({}).end();
    return;
  }
  const editedMark: boxData = await clientDB.updateBox(
    ownerName,
    boxName,
    { last_edited: 'now()' },
  );
  formatDate(editedMark);
  res.json({ edited, last_edited: editedMark.last_edited }).end();
};

const removeFile: middlewareFn = async (req: Request, res: Response) => {
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
  const checkup: [number, number]|null = await clientDB.checkBoxAccess(
    ownerName, viewerName, boxName, follower, editor
  );
  if (!checkup) { 
    res.json({}).end();
    return;
  }
  const removed: boolean = 
    await boxesStorage.removeFile(fileName, type, checkup, extraPath);
  if (!removed) { 
    res.json({}).end();
    return;
  } 
  const edited: boxData = await clientDB.updateBox(
    ownerName,
    boxName,
    { last_edited: 'now()' },
  );
  formatDate(edited);
  res.json({ removed, last_edited: edited.last_edited }).end();
};

const renameFile: middlewareFn = async (req: Request, res: Response) => {
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
  const checkup: [number, number]|null = await clientDB.checkBoxAccess(
    ownerName, viewerName, boxName, follower, editor
  );
  if (!checkup) { 
    res.json({}).end();
    return;
  }
  const edited: boxData = await clientDB.updateBox(
    ownerName,
    boxName,
    { last_edited: 'now()' },
  );
  formatDate(edited);
  const renamed: boolean = 
    await boxesStorage.renameFile(newName, fileName, checkup, extraPath);
  res.json({ renamed, last_edited: edited.last_edited }).end();
};


export {
  createBox,
  findUserBoxes,
  verifyBoxName,
  getBoxDetais,
  editBox,
  removeBox,
  getPathFiles,
  createFile,
  getFile,
  saveFile,
  removeFile,
  renameFile
};
