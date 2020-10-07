import { Request, Response } from 'express';
import { notificationsData, userData } from '../datatypes';
import UserDataConnector from '../database/UserClientDB/UserDataConnector';
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
const clientDB: UserDataConnector = new UserDataConnector();
clientDB.clientConnection();

const foundUsersMapper = async (user: userData): Promise<foundUser> => ({
  name: user.name, 
  name_color: user.name_color,
  logo: await userStorage.getLogoIfExists(user.id)
});

const signUpUser: middlewareFn = async (req: Request, res: Response) => {
  const clientData: userData = req.body;
  const inserted: userData = await clientDB.insertUser(clientData);
  if (!inserted) {
  res.json({}).end();
  return;
}
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
  const user: userData = await clientDB.signInUser(email, passwd);
  const name: string|null = user ? user.name : null;
  res.json({ name }).end();
};

const verifyUserInput: middlewareFn = async (req: Request, res: Response) => {
  const inputValue: string = req.body.inputValue;
  const column: string = req.body.inputField;
  const foundValue: string = await clientDB.checkColumn(column, inputValue);
  res.json({ foundValue }).end();
};

const verifyUserPassword: middlewareFn = async (req: Request, res: Response) => {
  const name: string = req.body.username;
  const passwd: string = req.body.passwd;
  const checked: boolean = await clientDB.checkPasswd(name, passwd);
  res.json({ checked }).end();
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
  if (rmAccess !== 'permitted') {
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
      usernames.map(foundUsersMapper)
    );
  res.json({ foundUsers }).end();
};

const getAccessLists: middlewareFn = async (req: Request, res: Response) => {
  const username: string = req.body.username;
  const boxName: string = req.body.boxName;
  const foundLists: userData[][] = 
    await clientDB.getLimitedUsers(username, boxName);
  const listsMapper = async (arr: userData[]): Promise<foundUser[]> => {
    return !arr.length ? [] :
      await Promise.all(arr.map(foundUsersMapper));
  };
  const [ limitedUsers, editors ]: foundUser[][] =
    await Promise.all(foundLists.map(listsMapper));
  res.json({ limitedUsers, editors }).end();
};

const subscription: middlewareFn = async (req: Request, res: Response) => {
  const { action, personName, subscriptionName, responseValues } : {
    action: 'subscribe'|'unsubscribe',
    personName: string,
    subscriptionName: string,
    responseValues: boolean
  } = req.body;
  const followers: number|null = 
    await clientDB.subscibe(personName, subscriptionName, action);
  if (followers === null) {
    res.json({}).end();
    return;
  }
  if (!responseValues) {
    res.json({ unsubscribed: true }).end();
    return;
  }
  const follower: boolean = action === 'subscribe' ?
    true : false
  res.json({ follower, followers }).end();
};

const getSubscriptions: middlewareFn = async (req: Request, res: Response) => {
  const name: string = req.body.name;
  const foundPersons: userData[]|null = await clientDB.getUserSubsciptions(name);
  if (!foundPersons) {
    res.json({}).end();
    return;
  }
  const subs: foundUser[] = await Promise.all(
    foundPersons.map(foundUsersMapper)
  );
  res.json({ subs }).end();
};

const searchUsers: middlewareFn = async (req: Request, res: Response) => {
  const searchStr: string = req.body.searchStr;
  const searchFormated: string = Array.from(searchStr)
    .filter(ch => ch !== ' ')
    .join('');
  const searchedUsers: userData[] = await clientDB.searchUsers(searchFormated);
  const searched: foundUser[] = await Promise.all(
    searchedUsers.map(foundUsersMapper)
  );
  res.json({ searched }).end();
};

const getNotifications: middlewareFn = async (req: Request, res: Response) => {
  const name: string = req.body.name;
  const notifications: notificationsData[] = await clientDB.getNotifications(name);
  if (!notifications.length) {
    res.json({ notifications }).end();
    return;
  }
  const ntsMapper = async (n: notificationsData): Promise<notificationsData> => {
    const icon: string|null = !n.param || n.param == -1 ?
      null : await userStorage.getLogoIfExists(n.param);
    const note_date: string = new Date(n.note_date)
      .toLocaleString()
      .replace(/\//g, '.');
    delete n.extra_values;
    delete n.param;
    return { ...n, icon, note_date };
  };
  const ntsRes: notificationsData[] = await Promise.all(
    notifications.map(ntsMapper)
  );
  res.json({ notifications: ntsRes }).end();
};

const removeNotifications: middlewareFn = async (req: Request, res: Response) => {
  const { username, ntsIds }: {
    username: string,
    ntsIds: number[]
  } = req.body;
  const removed: boolean = await clientDB.removeNotifications(username, ntsIds);
  res.json({ removed }).end()
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
  subscription,
  getSubscriptions,
  searchUsers,
  getNotifications,
  removeNotifications
};
