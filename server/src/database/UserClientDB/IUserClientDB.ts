import { UserData, NotificationsData } from '../../datatypes';

export default interface IUserClientDB {
  insertUser(userData: UserData): Promise<UserData|null>;
  updateUser(id: number, UserData: UserData): Promise<UserData|null>;
  removeUser(user_uid: string): Promise<void>;
  signInUser(email: string, passwd: string): Promise<UserData|null>;

  getUserData(values: UserData, returning?: string[]): Promise<UserData|null>;
  getUsersData(values: UserData, returning?: string[]): Promise<UserData[]|null>;
  getUserId(name: string): Promise<number|null>;

  checkColumn(column: string, value: string): Promise<string|null>;
  checkPasswd(name: string, passwd: string): Promise<boolean>;

  //subscribers
  getUserSubsciptions(name: string): Promise<UserData[]|null>;
  checkSubscription(person_id: number, subscription: number): Promise<boolean>;
  subscribe(
    personName: string,
    subscriptionName: string,
    action: 'subscribe'|'unsubscribe'
  ): Promise<number|null>;
    
  getUsernames(usersTemplate: string, username: string): Promise<UserData[]|null>;
  getUsernameByUuid(user_uid: string): Promise<string|null>;
  getLimitedUsers(username: string, boxName: string): Promise<UserData[][]>;
  searchUsers(nameTemplate: string): Promise<UserData[]>;
  
  //notifications
  getNotifications(name: string): Promise<NotificationsData[]>;
  removeNotifications(name: string, ids: number[]): Promise<boolean>;
}
