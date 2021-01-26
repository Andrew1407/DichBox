import { Request } from 'express';
import { NotificationsData, UserData } from '../../datatypes';
import { makeTuple } from '../extra';
import { formatDate, formatDateTime } from '../dateFormatters';
import { statuses, errMessages } from '../statusInfo';
import IUserClientDB from '../../database/UserClientDB/IUserClientDB';
import IUserStorageManager from '../../storageManagers/user/IUserStorageManager';
import UserControllerFactory from '../controllersFactory/UserControllerFactory';
import { UserRoutes } from '../routesTypes';
import IControllerFactory from '../controllersFactory/IControllerFactory';

type foundUser = {
  name: string,
  name_color: string,
  logo: string|null
};

const foundUsersMapper = async (user: UserData): Promise<foundUser> => ({
  name: user.name, 
  name_color: user.name_color,
  logo: await userStorage.getLogoIfExists(user.id)
});

const userFactory: IControllerFactory = new UserControllerFactory();
const clientDB: IUserClientDB = userFactory.getConnector() as IUserClientDB;
const userStorage: IUserStorageManager = userFactory.getStorageManager() as IUserStorageManager;

const userController: UserRoutes = {
  async signUpUser(req: Request) {
    const clientData: UserData = req.body;
    const inserted: UserData|null = await clientDB.insertUser(clientData);
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
    const user: UserData = await clientDB.getUserData({ name });
    if (!user) {
      const msg: string = errMessages.USER_NOT_FOUND;
      return makeTuple(statuses.NOT_FOUND, { msg });
    }
    let userRes: UserData & {
      follower?: boolean,
      logo?: string
    };
    user.reg_date = formatDate(String(user.reg_date));
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
    const user: UserData = await clientDB.signInUser(email, passwd);
    if (!user)
      return makeTuple(statuses.NOT_FOUND, { msg: errMessages.USER_NOT_FOUND });
    return user.name ?
      makeTuple(statuses.OK, { name: user.name }) :
      makeTuple(statuses.BAD_REQUEST, { msg: errMessages.INVALID_PASSWORD });
  },

  async verifyUserInput(req: Request) {
    const inputValue: string = req.body.inputValue;
    const column: string = req.body.inputField;
    const foundValue: string|null = await clientDB.checkColumn(column, inputValue);
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
    const editedData: UserData|null = req.body.edited;
    const editedLogo: string|null = req.body.logo;
    const editedResponse: UserData & { logo?: string } = {};
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
    const id: number = await clientDB.getUserId(name);
    if (rmAccess !== 'permitted' || !id) {
      const msg: string = errMessages.FORBIDDEN;
      return makeTuple(statuses.FORBIDDEN, { msg });
    }
    await Promise.all([
      userStorage.removeUser(id),
      clientDB.removeUser(id)
    ]);
    return makeTuple(statuses.OK, { removed: true });
  },
  
  async findUsernames(req: Request) {
    const nameTemplate: string = req.body.nameTemplate;
    const username: string = req.body.username;
    const usernames: UserData[]|null = await clientDB.getUsernames(nameTemplate, username);
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
    const foundLists: UserData[][] = 
      await clientDB.getLimitedUsers(username, boxName);
    const listsMapper = async (arr: UserData[]): Promise<foundUser[]> =>(
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
      await clientDB.subscribe(personName, subscriptionName, action);
    if (followers === null) {
      const msg: string = errMessages.SUBSCRIPTIONS_NOT_FOUND;
      return makeTuple(statuses.NOT_FOUND, { msg });
    }
    const subscribeAction: boolean = action === 'subscribe';
    if (!responseValues) 
      return makeTuple(statuses.OK, { unsubscribed: !subscribeAction });
    return makeTuple(statuses.OK, { followers, follower: subscribeAction });
  },

  async getSubscriptions(req: Request) {
    const name: string = req.body.name;
    const foundPersons: UserData[]|null = await clientDB.getUserSubsciptions(name);
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
    const searchedUsers: UserData[] = await clientDB.searchUsers(searchFormated);
    const searched: foundUser[] = await Promise.all(
      searchedUsers.map(foundUsersMapper)
    );
    return makeTuple(statuses.OK, { searched });  
  },

  async getNotifications(req: Request) {
    const name: string = req.body.name;
    const notifications: NotificationsData[] = await clientDB.getNotifications(name);
    if (!notifications.length)
      return makeTuple(statuses.OK, { notifications });
    const ntsMapper = async (n: NotificationsData): Promise<NotificationsData> => {
      const icon: string|null = !n.param || n.param == -1 ?
        null : await userStorage.getLogoIfExists(n.param);
      n.note_date = formatDateTime(String(n.note_date));
      delete n.extra_values;
      delete n.param;
      return { ...n, icon };
    };
    const ntsRes: NotificationsData[] = await Promise.all(
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
