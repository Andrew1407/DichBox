import { Request } from 'express';
import { notificationsData, userData } from '../../datatypes';
import { makeTuple } from '../extra';
import { statuses, errMessages } from '../statusInfo';
import UserDataConnector from '../../database/UserClientDB/UserDataConnector';
import UserStotageManager from '../../storageManagers/UserStotageManager';
import { userRouters } from '../routesTypes';

type foundUser = {
  name: string,
  name_color: string,
  logo: string|null
};

const foundUsersMapper = async (user: userData): Promise<foundUser> => ({
  name: user.name, 
  name_color: user.name_color,
  logo: await userStorage.getLogoIfExists(user.id)
});

const userStorage: UserStotageManager = new UserStotageManager;
const clientDB: UserDataConnector = new UserDataConnector();
clientDB.clientConnection();

const userController: userRouters = {
  async signUpUser(req: Request) {
    const clientData: userData = req.body;
    const inserted: userData = await clientDB.insertUser(clientData);
    if (!inserted) {
      const msg: string = errMessages.USER_INVAID_REQUEST;
      return makeTuple(statuses.BAD_REQUEST, { msg });
    }
    await userStorage.createUserStorage(inserted.id);
    delete inserted.id;
    return makeTuple(statuses.CREATED, inserted);
  },

  async findUser(req: Request) {
    const name: string = req.body.pathName;
    const username: string = req.body.username;
    const ownPage: boolean = name === username;
    const user: userData = await clientDB.getUserData({ name });
    if (!user) {
      const msg: string = errMessages.USER_NOT_FOUND;
      return makeTuple(statuses.NOT_FOUND, { msg });
    }
    let userRes: userData & {
      follower?: boolean,
      logo?: string
    };
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
    return makeTuple(statuses.OK, { ...userRes, ownPage });
  },

  async signInUser(req: Request) {
    const email: string = req.body.email;
    const passwd: string = req.body.passwd;
    const user: userData = await clientDB.signInUser(email, passwd);
    const name: string|null = user ? user.name : null;
    return name ?
      makeTuple(statuses.OK, { name }) :
      makeTuple(statuses.NOT_FOUND, { msg: errMessages.USER_NOT_FOUND });
  },

  async verifyUserInput(req: Request) {
    const inputValue: string = req.body.inputValue;
    const column: string = req.body.inputField;
    const foundValue: string = await clientDB.checkColumn(column, inputValue);
    return makeTuple(statuses.OK, { foundValue });
  },

  async verifyUserPassword(req: Request) {
    const name: string = req.body.username;
    const passwd: string = req.body.passwd;
    const checked: boolean = await clientDB.checkPasswd(name, passwd);
    return makeTuple(statuses.OK, { checked });
  },

  async editUser(req: Request) {
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
    return makeTuple(statuses.OK, editedResponse);
  },

  async removeUser(req: Request) {
    const name: string = req.body.username;
    const rmAccess: string = req.body.confirmation;
    if (rmAccess !== 'permitted') {
      const msg: string = errMessages.FORBIDDEN;
      return makeTuple(statuses.FORBIDDEN, { msg });
    }
    const id: number = await clientDB.getUserId(name);
    await Promise.all([
      userStorage.removeUser(id),
      clientDB.removeUser(id)
    ]);
    return makeTuple(statuses.OK, { removed: true });
  },
  
  async findUsernames(req: Request) {
    const nameTemplate: string = req.body.nameTemplate;
    const username: string = req.body.username;
    const usernames: userData[]|null = await clientDB.getUsernames(nameTemplate, username);
    let foundUsers: foundUser[] = [];
    if (usernames)
      foundUsers = await Promise.all(
        usernames.map(foundUsersMapper)
      );
    return makeTuple(statuses.OK, { foundUsers });
  },

  async getAccessLists(req: Request) {
    const username: string = req.body.username;
    const boxName: string = req.body.boxName;
    const foundLists: userData[][] = 
      await clientDB.getLimitedUsers(username, boxName);
    const listsMapper = async (arr: userData[]): Promise<foundUser[]> =>(
      await arr.length ? Promise.all(arr.map(foundUsersMapper)) : []
    );
    const [ limitedUsers, editors ]: foundUser[][] =
      await Promise.all(foundLists.map(listsMapper));
    return makeTuple(statuses.OK, { limitedUsers, editors });
  },

  async subscription(req: Request) {
    const { action, personName, subscriptionName, responseValues } : {
      action: 'subscribe'|'unsubscribe',
      personName: string,
      subscriptionName: string,
      responseValues: boolean
    } = req.body;
    const followers: number|null = 
      await clientDB.subscibe(personName, subscriptionName, action);
    if (followers === null) {
      const msg: string = errMessages.SUBSCRIPTIONS_NOT_FOUND;
      return makeTuple(statuses.NOT_FOUND, { msg });
    }
    if (!responseValues) 
      return makeTuple(statuses.OK, { unsubscribed: true });
    const follower: boolean = action === 'subscribe';
    return makeTuple(statuses.OK, { follower, followers });
  },

  async getSubscriptions(req: Request) {
    const name: string = req.body.name;
    const foundPersons: userData[]|null = await clientDB.getUserSubsciptions(name);
    if (!foundPersons) {
      const msg: string = errMessages.USER_NOT_FOUND;
      return makeTuple(statuses.NOT_FOUND, { msg });
    }
    const subs: foundUser[] = await Promise.all(
      foundPersons.map(foundUsersMapper)
    );
    return makeTuple(statuses.OK, { subs });  
  },

  async searchUsers(req: Request) {
    const searchStr: string = req.body.searchStr;
    const searchFormated: string = Array.from(searchStr)
      .filter(ch => ch !== ' ')
      .join('');
    const searchedUsers: userData[] = await clientDB.searchUsers(searchFormated);
    const searched: foundUser[] = await Promise.all(
      searchedUsers.map(foundUsersMapper)
    );
    return makeTuple(statuses.OK, { searched });  
  },

  async getNotifications(req: Request) {
    const name: string = req.body.name;
    const notifications: notificationsData[] = await clientDB.getNotifications(name);
    if (!notifications.length)
      return makeTuple(statuses.OK, { notifications });
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
    return makeTuple(statuses.OK, { notifications: ntsRes });  
  },

  async removeNotifications(req: Request) {
    const { username, ntsIds }: {
      username: string,
      ntsIds: number[]
    } = req.body;
    const removed: boolean = await clientDB.removeNotifications(username, ntsIds);
    return makeTuple(statuses.OK, { removed });  
  }
};

export default userController;
