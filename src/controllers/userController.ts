import DichBoxDB from '../database/DichBoxDB';
import { Request, Response } from 'express';
import { userInput, userData } from '../datatypes';
import * as fs from 'fs';

type middlewareFn = (req: Request, res: Response) => Promise<void>;
type userResponse = {
  name: string,
  description: string,
  reg_date: string,
  followers?: number,
  subscriptions?: number[]
  passwd?: string,
  email?: string
  id?: number,
  name_color?: string,
  description_color?: string
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
    name_color,
    description_color,
    id
  }: userData = userData;
  const dateFromated: string = new Date(reg_date).toLocaleDateString();
  const regDate = dateFromated.replace(/\//g, '.');
  const res: userResponse = {
    name_color,
    description_color,
    id,
    name,
    reg_date: regDate,
    description,
    followers
  };
  return !modifier ? res : { ...res, email, subscriptions };
};

const signUpUser: middlewareFn = async (req: Request, res: Response) => {
  const clientData: userInput = req.body;
  const signedUser: userData = await clientDB.insertUser(clientData);
  res.json({ id: signedUser.id }).end();
};

const findUser: middlewareFn = async (req: Request, res: Response) => {
  const name: string = req.body.name;
  const id: number = Number(req.body.id);
  const user: userData = await clientDB.findUserByColumns({ name });
  const ownPage: boolean = id === user.id;
  const userRes: userResponse|null = user ?
    formatUserFields(user, ownPage) : null;
  res.json({ ...userRes, ownPage }).end();
};

const signInUser: middlewareFn = async (req: Request, res: Response) => {
  const email: string = req.body.email;
  const passwd: string = req.body.passwd;
  const user: userData = await clientDB.findUserByColumns({ email, passwd });
  const id: number|null = user ? user.id : null;
  res.json({ id }).end();
};

const verifyUserInput: middlewareFn = async (req: Request, res: Response) => {
  const inputValue: string = req.body.inputValue;
  const column: string = req.body.inputField;
  const verifyField: userInput = { [column]: inputValue };
  const foundUser: userData = await clientDB.findUserByColumns(verifyField);
  const foundValue: string|number|null = foundUser ? foundUser[column] : null;
  res.json({ foundValue }).end();
};

const verifyUserPassword: middlewareFn = async (req: Request, res: Response) => {
  const id: number = req.body.id;
  const passwd: string = req.body.passwd;
  const foundUser: userData = await clientDB.findUserByColumns({ id, passwd });
  const foundValue: string = foundUser ? foundUser.passwd : null;
  res.json({ foundValue }).end();
};

const getUsername: middlewareFn = async (req: Request, res: Response) => {
  const id: number = req.body.id;
  const foundUser: userData = await clientDB.findUserById(id);
  const name: string = foundUser ? foundUser.name : null;
  res.json({ name }).end();
};

const editUser: middlewareFn = async (req: Request, res: Response) => {
  const id: number = req.body.id;
  const editedData: userInput|null = req.body.edited;
  const editedLogo: {
    name: string,
    src: string
  } = req.body.logo;
  // if (editedData) {
  //   const editedUser = await clientDB.updateUser(id, editedData);
  //   const editedResponse: userInput = {};
  //   for (const field in editedData) {
  //     if (field === 'passwd') continue;
  //     editedResponse[field] = editedUser[field];
  //   }
  //   res.json({ editedResponse }).end();
  // }
  const base64Data = editedLogo.src
    .replace(/^data:image\/png;base64,/, '');
  fs.writeFileSync(editedLogo.name, base64Data, 'base64');
};

export {
  findUser,
  signUpUser,
  signInUser,
  verifyUserInput,
  getUsername,
  verifyUserPassword,
  editUser
};
