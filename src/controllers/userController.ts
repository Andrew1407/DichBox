import { Request, Response } from 'express';
import { userData } from '../datatypes';
import UserClientDichBoxDB from '../database/UserClientDichBoxDB';
import UserStotageManager from '../storageManagers/UserStotageManager';

type middlewareFn = (req: Request, res: Response) => Promise<void>;
type userResponse = userData & {
  follower?: boolean,
  logo?: string
};
type foundUser = {
  name: string,
  name_color: string,
  logo: string|null
};


const userStorage: UserStotageManager = new UserStotageManager;
const clientDB: UserClientDichBoxDB = new UserClientDichBoxDB();
clientDB.clientConnection();

const foudUsersMapper = async (user: userData): Promise<foundUser> => ({
  name: user.name, 
  name_color: user.name_color,
  logo: await userStorage.getLogoIfExists(user.id)
});

const signUpUser: middlewareFn = async (req: Request, res: Response) => {
  const clientData: userData = req.body;
  const inserted: userData = await clientDB.insertUser(clientData);
  await userStorage.createUserStorage(inserted.id);
  delete inserted.id;
  res.json(inserted).end();
};

const findUser: middlewareFn = async (req: Request, res: Response) => {
  const name: string = req.body.pathName;
  const username: string = req.body.username;
  const ownPage: boolean = name === username;
  const user: userData = await clientDB.getUserData({ name });
  let userRes: userResponse;
  if (!user) {
    res.json({}).end();
    return;
  }
  user.reg_date = new Date(user.reg_date)
    .toLocaleDateString()
    .replace(/\//g, '.');
  const logo: string|null = await userStorage.getLogoIfExists(user.id);
  userRes = { ...user, logo, follower: false };
  if (!ownPage) {
    delete user.email;
    const searchId: number = await clientDB.getUserId(username);
    const follower: boolean = await clientDB.checkSubscription(searchId, user.id);
    userRes.follower = follower;
  }
  delete userRes.id;
  res.json({ ...userRes, ownPage }).end();
};

const signInUser: middlewareFn = async (req: Request, res: Response) => {
  const email: string = req.body.email;
  const passwd: string = req.body.passwd;
  const user: userData = await clientDB.getUserData(
    { email, passwd },
    ['name']
  );
  const name: string|null = user ? user.name : null;
  res.json({ name }).end();
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
  const name: string = req.body.username;
  const passwd: string = req.body.passwd;
  const foundUser: userData = await clientDB.getUserData(
    { name, passwd },
    ['passwd']
  );
  const foundValue: string = foundUser ? foundUser.passwd : null;
  res.json({ foundValue }).end();
};

const editUser: middlewareFn = async (req: Request, res: Response) => {
  const username: string = req.body.username;
  const editedData: userData|null = req.body.edited;
  const editedLogo: string|null = req.body.logo;
  const editedResponse: userData & { logo?: string } = {};
  const id: number = await clientDB.getUserId(username);
  if (Object.keys(editedData).length) {
    await clientDB.updateUser(id, editedData);
    for (const field in editedData)
      if (field !== 'passwd')
        editedResponse[field] = editedData[field];
  }
  if (editedLogo) 
    if (editedLogo === 'removed') {
      await userStorage.removeLogoIfExists(id);
      editedResponse.logo = null;
    } else {
      const savedLogo: string = await userStorage.saveLogo(editedLogo, id);
      editedResponse.logo = savedLogo;
    }
  res.json({ ...editedResponse }).end();
};

const removeUser: middlewareFn = async (req: Request, res: Response) => {
  const name: string = req.body.username;
  const rmAccess: string = req.body.confirmation;
  if (rmAccess !==  'permitted') {
    res.json({ removed: false }).end();
    return;
  }
  const id: number = await clientDB.getUserId(name);
  await Promise.all([
    userStorage.removeUser(id),
    clientDB.removeUser(id)
  ]);
  res.json({ removed: true }).end();
};

const findUsernames: middlewareFn = async (req: Request, res: Response) => {
  const nameTemplate: string = req.body.nameTemplate;
  const username: string = req.body.username;
  const usernames: userData[]|null = await clientDB.getUsernames(nameTemplate, username);
  let foundUsers: foundUser[] = [];
  if (usernames)
    foundUsers = await Promise.all(
      usernames.map(foudUsersMapper)
    );
  res.json({ foundUsers }).end();
};

const getAccessLists: middlewareFn = async (req: Request, res: Response) => {
  const username: string = req.body.username;
  const boxName: string = req.body.boxName;
  const foundLists: userData[][] = 
    await clientDB.getLimitedUsers(username, boxName);
  const listsMapper = async (arr: userData[]): Promise<foundUser[]> => {
    return await arr.length ?
      Promise.all(arr.map(foudUsersMapper)) : [];
  };
  const [ limitedUsers, editors ]: foundUser[][] =
    await Promise.all(foundLists.map(listsMapper));
  res.json({ limitedUsers, editors }).end();
};

const subscription: middlewareFn = async (req: Request, res: Response) => {
  const action: 'subscribe'|'unsubscribe' = req.body.action;
  const personName: string = req.body.personName;
  const subscriptionName: string = req.body.subscriptionName;
  const followers: number|null = 
    await clientDB.subscibe(personName, subscriptionName, action);
  if (followers === null) {
    res.json({}).end();
    return;
  }
  const follower: boolean = action === 'subscribe' ?
    true : false
  res.json({ follower, followers }).end();
};

export {
  findUser,
  signUpUser,
  signInUser,
  verifyUserInput,
  verifyUserPassword,
  editUser,
  removeUser,
  findUsernames,
  getAccessLists,
  subscription
};
