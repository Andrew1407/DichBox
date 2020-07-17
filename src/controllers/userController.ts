import DichBoxDB from '../database/DichBoxDB';
import { Request, Response } from 'express';
import { userInput, userData } from '../datatypes';

type middlewareFn = (req: Request, res: Response) => Promise<void>;
type userResponse = {
  name: string,
  description: string,
  reg_date: Date,
  followers?: number,
  subscriptions?: number[]
  passwd?: string,
  email?: string
  id?: number
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
    email,
    id
  }: userData = userData;
  return modifier ? 
  { id, name, reg_date, description, email, followers, subscriptions } :
  { name, reg_date, description, followers };
};

const signUpUser: middlewareFn = async (req: Request, res: Response) => {
  const clientData: userInput = req.body;
  const signedUser: userData = await clientDB.insertUser(clientData);
  const userRes: userResponse = formatUserFields(signedUser, true);
  res.json(userRes).end();
};

const findUser: middlewareFn = async (req: Request, res: Response) => {
  const id: number = req.body.id;
  const ownPage: boolean = req.body.ownPage;
  const user: userData = await clientDB.findUser(id);
  if (user) {
    const userRes: userResponse = formatUserFields(user, ownPage);
    res.json(userRes).end();
  } else {
    res.json(null).end();
  }
};

const signInUser: middlewareFn = async (req: Request, res: Response) => {
  const email: string = req.body.email;
  const passwd: string = req.body.passwd;
  const user: userData = await clientDB.findUserByEmail(email, passwd);
  if (user) {
    const userRes: userResponse = formatUserFields(user, true);
    res.json(userRes).end();
  } else {
    res.json(null).end();
  }
};

const verifyUserInput: middlewareFn = async (req: Request, res: Response) => {
  const inputValue: string = req.body.inputValue;
  const column: string = req.body.inputField;
  const foundValue: string|undefined = await clientDB.findUserColumnValue(column, inputValue);
  res.json({ foundValue }).end();
};


export {
  findUser,
  signUpUser,
  signInUser,
  verifyUserInput
};
