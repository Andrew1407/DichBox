import { Request, Response } from 'express';
import { boxData, privacyList } from '../datatypes';
import BoxesClientDichBoxDB from '../database/BoxesClientDichBoxDB';
import BoxManager from '../storageManagers/BoxManager';

type middlewareFn = (req: Request, res: Response) => Promise<void>;
type boxListRequest = {
  viewerId: number,
  boxOwnerId: number,
  follower: boolean
};
// type boxRequest

const boxManager: BoxManager = new BoxManager();
const clientDB: BoxesClientDichBoxDB = new BoxesClientDichBoxDB();
clientDB.clientConnection();

const createBox: middlewareFn = async (req: Request, res: Response) => {
  const { boxData, boxLogo, privacyList, username }: {
    boxData: boxData,
    boxLogo: string|null,
    privacyList: privacyList|null,
    username: string
  } = req.body;
  const createdBox: boxData = await clientDB.insertBox(boxData, privacyList);
  await boxManager.createBox(
    username,
    createdBox.name,
    boxLogo && [createdBox.id, boxLogo]
  );
  res.json({ name: createdBox.name }).end();
};

const findUserBoxes: middlewareFn = async (req: Request, res: Response) => {
  const { viewerId,  boxOwnerId, follower }: boxListRequest = req.body;
  const boxesList: boxData[]|null = await clientDB.getBoxesList(
    viewerId, boxOwnerId, follower
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
  const boxPath: string = req.body.path;
  const follower: boolean = req.body.follower;
  const owner_id: number = req.body.owner_id;
  const viewer_id: number = req.body.viewer_id;
  const boxName: string = boxPath
    .split('/')
    .slice(2, 3)[0];
  const boxInfo: boxData|null = await clientDB.getBoxInfo(
    boxName, viewer_id, owner_id, follower
  );
  if (boxInfo) {
    const logo: string|null = await boxManager.getLogoIfExists(boxInfo.id);
    delete boxInfo.id;
    ['reg_date', 'last_edited'].forEach(x => {
      boxInfo[x] = new Date(boxInfo[x])
        .toLocaleString()
        .replace(/\//g, '.');
    });
    res.json({ ...boxInfo, logo }).end();
  } else {
    res.json({}).end();
  }
};

export {
  createBox,
  findUserBoxes,
  verifyBoxName,
  getBoxDetais
};
