import DichBoxDB from '../database/DichBoxDB';
import { Request, Response } from 'express';
import { userInput, userData } from '../datatypes';

type middlewareFn = (req: Request, res: Response) => Promise<void>;
type userResponse = {
  name: string,
  description: string,
  reg_date: Date,
  // followers: number,
  // subscriptions: number[]
  passwd?: string,
  email?: string 
};

const clientDB: DichBoxDB = new DichBoxDB();
clientDB.clientConnection();

const formatUserFields = (
  userData: userData,
  modifier: boolean
): userResponse => {
  const { 
    name,
    description,
    reg_date,
    followers,
    subscriptions,
    passwd,
    email
  }: userData = userData;
  return modifier ? 
    { name, reg_date, description } :
    { name, reg_date, description, passwd, email };
};

const signUpUser: middlewareFn = async (req: Request, res: Response) => {
  const clientData: userInput = req.body;
  const signedUser = await clientDB.insertUser(clientData);
  res.json(signedUser).end();
};

const findUser: middlewareFn = async (req: Request, res: Response) => {
  const username: string = req.body.name;
  const visitor: boolean = req.body.isVisitor;
  const user: userData = await clientDB.findUserByName(username);
  if (user) {
    const userRes: userResponse = formatUserFields(user, visitor)
    res.json(userRes).end();
  } else {
    res.json(user).end();
  }
};

export {
  findUser,
  signUpUser
};
