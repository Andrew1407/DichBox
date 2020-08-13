import { Request, Response } from 'express';
import { userData } from '../datatypes';
import UserClientDichBoxDB from '../database/UserClientDichBoxDB';
import LogoManager from '../storageManagers/LogoManager';

type middlewareFn = (req: Request, res: Response) => Promise<void>;
type userResponse = userData & {
  follower?: boolean,
  logo?: string
};

const userLogo: LogoManager = new LogoManager('users');
const clientDB: UserClientDichBoxDB = new UserClientDichBoxDB();
clientDB.clientConnection();

const signUpUser: middlewareFn = async (req: Request, res: Response) => {
  const clientData: userData = req.body;
  const { id }: userData = await clientDB.insertUser(clientData);
  res.json({ id }).end();
};

const findUser: middlewareFn = async (req: Request, res: Response) => {
  const name: string = req.body.name;
  const id: number = req.body.id;
  const user: userData = await clientDB.getUserData({ name });
  const ownPage: boolean = id === user.id;
  let userRes: userResponse|null = null;
  if (user) {
    user.reg_date = new Date(user.reg_date)
      .toLocaleDateString()
      .replace(/\//g, '.');
    if (!ownPage)
      delete user.email;
    const logo: string = await userLogo.getLogoIfExists(user.id);
    userRes = { ...user, logo };
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
  const user: userData = await clientDB.getUserData(
    { email, passwd },
    ['id']
  );
  const id: number|null = user ? user.id : null;
  res.json({ id }).end();
};

const verifyUserInput: middlewareFn = async (req: Request, res: Response) => {
  const inputValue: string = req.body.inputValue;
  const column: string = req.body.inputField;
  const verifyField: userData = { [column]: inputValue };
  const foundUser: userData = await clientDB.getUserData(
    verifyField,
    [column]
  );
  const foundValue: string|number|null = foundUser ? foundUser[column] : null;
  res.json({ foundValue }).end();
};

const verifyUserPassword: middlewareFn = async (req: Request, res: Response) => {
  const id: number = req.body.id;
  const passwd: string = req.body.passwd;
  const foundUser: userData = await clientDB.getUserData(
    { id, passwd },
    ['passwd']
  );
  const foundValue: string = foundUser ? foundUser.passwd : null;
  res.json({ foundValue }).end();
};

const getUsername: middlewareFn = async (req: Request, res: Response) => {
  const id: number = req.body.id;
  const foundUser: userData = await clientDB.getUserData({ id }, ['name']);
  const name: string = foundUser ? foundUser.name : null;
  res.json({ name }).end();
};

const editUser: middlewareFn = async (req: Request, res: Response) => {
  const id: number = req.body.id;
  const editedData: userData|null = req.body.edited;
  const editedLogo: string = req.body.logo;
  const editedResponse: userData & { logo?: string } = {};
  if (Object.keys(editedData).length) {
    await clientDB.updateUser(id, editedData);
    for (const field in editedData)
      if (field !== 'passwd')
        editedResponse[field] = editedData[field];
  }
  if (editedLogo) {
    const savedLogo: string = await userLogo.saveLogo(editedLogo, id);
    editedResponse.logo = savedLogo;
  }
  res.json({ ...editedResponse }).end();
};

const removeUser: middlewareFn = async (req: Request, res: Response) => {
  const id: number = req.body.id;
  const rmAccess: string = req.body.confirmation;
  if (rmAccess !==  'permitted') {
    res.json({ removed: false }).end();
  } else {
    await Promise.all([
      userLogo.removeLogoIfExists(id),
      clientDB.removeUser(id)
    ]);
    res.json({ removed: true }).end();
  }
};

const findUsernames: middlewareFn = async (req: Request, res: Response) => {
  const nameTemplate: string = req.body.nameTemplate;
  const usernames: userData[]|null = await clientDB.getUsernames(nameTemplate);
  type foundUser = {
    name: string,
    logo: string|null
  };
  let foundUsers: foundUser[] = [];
  if (usernames) {
    const foudUsersMapper = async (
      user: { id: number, name: string }
    ): Promise<foundUser> => ({
      name: user.name, 
      logo: await userLogo.getLogoIfExists(user.id)
    });
    foundUsers = await Promise.all(
      usernames.map(foudUsersMapper)
    );
  }
  res.json({ foundUsers }).end();
};

export {
  findUser,
  signUpUser,
  signInUser,
  verifyUserInput,
  getUsername,
  verifyUserPassword,
  editUser,
  removeUser,
  findUsernames
};
