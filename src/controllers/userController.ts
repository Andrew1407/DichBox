import { Request, Response } from 'express';
import { userInput, userData } from '../datatypes';
import UserClientDichBoxDB from '../database/UserClientDichBoxDB';
import LogoManager from '../storageManagers/LogoManager';

type middlewareFn = (req: Request, res: Response) => Promise<void>;
type userResponse = userInput & {
  reg_date: string,
  followers: number,
  follower?: boolean,
  logo?: string
};

const userLogo: LogoManager = new LogoManager('users');

const clientDB: UserClientDichBoxDB = new UserClientDichBoxDB();
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
  return !modifier ? res : { ...res, email };
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
  let userRes: userResponse|null = null;
  if (user) {
    const dataFields: userResponse = formatUserFields(user, ownPage);
    const logo: string = await userLogo.getLogo(user.id);
    userRes = { ...dataFields, logo };
    if (!ownPage) {
      const follower: boolean = await clientDB.checkSubscription(user.id, id);
      userRes = { ...userRes, follower };
    }
  }
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
  const editedLogo: string = req.body.logo;
  const editedResponse: userInput & { logo?: string } = {};
  if (Object.keys(editedData).length) {
    await clientDB.updateUser(id, editedData);
    for (const field in editedData) {
      if (field === 'passwd') continue;
      editedResponse[field] = editedData[field];
    }
  }
  if (editedLogo) {
    const savedLogo: string = await userLogo.saveLogo(editedLogo, id);
    editedResponse.logo = savedLogo;
  }
  res.json({ ...editedResponse }).end();
};

const removeUser: middlewareFn = async (req: Request, res: Response) => {
  const id: number = req.body.id;
  if (req.body.confirmation !==  'permitted') {
    res.json({ removed: false }).end();
  } else {
    userLogo.removeLogoIfExists(id);
    clientDB.removeUser(id);
    res.json({ removed: true }).end();
  }
};

export {
  findUser,
  signUpUser,
  signInUser,
  verifyUserInput,
  getUsername,
  verifyUserPassword,
  editUser,
  removeUser
};
