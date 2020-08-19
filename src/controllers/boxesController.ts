import { Request, Response } from 'express';
import { boxData } from '../datatypes';
import BoxesClientDichBoxDB from '../database/BoxesClientDichBoxDB';
import BoxesStorageManager from '../storageManagers/BoxesStorageManager';

type middlewareFn = (req: Request, res: Response) => Promise<void>;
type boxListRequest = {
  viewerName: string,
  boxOwnerName: string,
  follower: boolean
};

const storageManager: BoxesStorageManager = new BoxesStorageManager();
const clientDB: BoxesClientDichBoxDB = new BoxesClientDichBoxDB();
clientDB.clientConnection();

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
  await storageManager.createBox(
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
  const logo: string|null = await storageManager.getLogoIfExists(boxInfo.id);
  delete boxInfo.id;
  ['reg_date', 'last_edited'].forEach(x => {
    boxInfo[x] = new Date(boxInfo[x])
      .toLocaleString()
      .replace(/\//g, '.');
  });
  delete boxInfo.id;
  res.json({ ...boxInfo, logo }).end();
};

const editBox: middlewareFn = async (req: Request, res: Response) => {
  const username: string = req.body.username;
  const logo: string|null = req.body.logo;
  const limitedList: string[] = req.body.limitedUsers;
  const editorsList: string[] = req.body.editors;
  const boxData: boxData|null = req.body.boxData;
  const boxName: string = req.body.boxName;
  console.log(req.body)
  const updated: boxData = await clientDB.updateBox(
    username, boxName, boxData, limitedList, editorsList
  );
  // if (boxData && boxData.name)
  //   await storageManager.renameBox(username, boxName, boxData.name);
  // if (logo)
  //   await (logo === 'removed') ?
  //     storageManager.removeLogoIfExists(updated.id) :
  //     storageManager.saveLogo(logo, updated.id);
  // delete updated.id;
  // res.json({ ...updated, logo }).end();
  res.end();
};

export {
  createBox,
  findUserBoxes,
  verifyBoxName,
  getBoxDetais,
  editBox
};
