import { Request, Response } from 'express';
import { boxData, privacyList } from '../datatypes';
import BoxesClientDichBoxDB from '../database/BoxesClientDichBoxDB';
import BoxManager from '../storageManagers/BoxManager';

type middlewareFn = (req: Request, res: Response) => Promise<void>;

const boxManager: BoxManager = new BoxManager();
const clientDB: BoxesClientDichBoxDB = new BoxesClientDichBoxDB();
clientDB.clientConnection();

const createBox: middlewareFn = async (req: Request, res: Response) => {
  const boxData: boxData = req.body.boxData;
  const boxLogo: string|null = req.body.logo;
  const privacyList: privacyList|null = req.body.privacyList;
  const username: string = req.body.username;
  const createdBox: boxData = await clientDB.insertBox(boxData, privacyList);
  await boxManager.createBox(
    username,
    createdBox.name,
    boxLogo && [createdBox.id, boxLogo]
  );
  res.json({ name: createdBox.name }).end();
};

const findUserBoxes: middlewareFn = async (req: Request, res: Response) => {
  const viewerId: number = req.body.id;
  const ownPage: boolean = req.body.ownPage;
  const followed: boolean = req.body.followed;
  const boxesList: boxData[]|null = await clientDB.getBoxesList(
    viewerId, ownPage, followed
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

export {
  createBox,
  findUserBoxes,
  verifyBoxName
};
