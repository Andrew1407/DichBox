import DichBoxDB from '../database/DichBoxDB';
import { Request, Response } from 'express';
import { userInput, userData } from '../datatypes';

type middlewareFn = (req: Request, res: Response) => Promise<void>;
type userResponse = {
  name: string,
  description: string,
  reg_date: string,
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
  const reg_dateFromated: string = new Date(reg_date).toDateString();
  return modifier ? 
  { id, name, reg_date: reg_dateFromated, description, email, followers, subscriptions } :
  { id, name, reg_date: reg_dateFromated, description, followers };
};

const signUpUser: middlewareFn = async (req: Request, res: Response) => {
  const clientData: userInput = req.body;
  const signedUser: userData = await clientDB.insertUser(clientData);
  res.json({ id: signedUser.id }).end();
};

const findUser: middlewareFn = async (req: Request, res: Response) => {
  const name: string = req.body.name;
  const ownPage: boolean = req.body.ownPage;
  const user: userData = await clientDB.findUserByColumn('name', name);
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
  const id: number|null = user ? user.id : null;
  res.json({ id }).end();
};

const verifyUserInput: middlewareFn = async (req: Request, res: Response) => {
  const inputValue: string = req.body.inputValue;
  const column: string = req.body.inputField;
  const foundUser: userData = await clientDB.findUserByColumn(column, inputValue);
  const foundValue: string|number|null = foundUser ? 
    foundUser[column] : null;
  res.json({ foundValue }).end();
};

const getUsername: middlewareFn = async (req: Request, res: Response) => {
  const id: number = req.body.id;
  const foundUser: userData = await clientDB.findUserByColumn('id', id);
  const name: string = foundUser ? foundUser.name : null;
  res.json({ name }).end();
};


export {
  findUser,
  signUpUser,
  signInUser,
  verifyUserInput,
  getUsername
};
