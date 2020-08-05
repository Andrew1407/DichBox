import { Request, Response } from 'express';
import { boxData, boxInput } from '../datatypes';
import BoxesClientDichBoxDB from '../database/BoxesClientDichBoxDB';

type middlewareFn = (req: Request, res: Response) => Promise<void>;

const clientDB: BoxesClientDichBoxDB = new BoxesClientDichBoxDB();
clientDB.clientConnection();

const createBox: middlewareFn = async (req: Request, res: Response) => {
  
};

const findUserBoxes: middlewareFn = async (req: Request, res: Response) => {
  const viewerId: number = req.body.id;
  const ownPage: boolean = req.body.ownPage;
  const followed: boolean = req.body.followed;
  const boxesList: boxInput[]|null = await clientDB.getBoxesList(
    viewerId, ownPage, followed
  );
  res.json({ boxesList }).end;
};

export {
  createBox,
  findUserBoxes
};
