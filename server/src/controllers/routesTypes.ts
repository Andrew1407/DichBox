import { Response, Request } from 'express';

export type responseTuple = [number, any];    // [status, json]

export type middlewareFn = (req: Request, res: Response) => Promise<void>;

export type requestHandler = (req: Request) => Promise<responseTuple>;

export type boxesRouters = {
  createBox: middlewareFn|requestHandler,
  findUserBoxes: middlewareFn|requestHandler,
  verifyBoxName: middlewareFn|requestHandler,
  getBoxDetais: middlewareFn|requestHandler,
  editBox: middlewareFn|requestHandler,
  removeBox: middlewareFn|requestHandler,
  getPathFiles: middlewareFn|requestHandler,
  createFile: middlewareFn|requestHandler,
  getFile: middlewareFn|requestHandler,
  saveFiles: middlewareFn|requestHandler,
  removeFile: middlewareFn|requestHandler,
  renameFile: middlewareFn|requestHandler
};

export type userRouters = {
  findUser: middlewareFn|requestHandler,
  signUpUser: middlewareFn|requestHandler,
  signInUser: middlewareFn|requestHandler,
  verifyUserInput: middlewareFn|requestHandler,
  verifyUserPassword: middlewareFn|requestHandler,
  editUser: middlewareFn|requestHandler,
  removeUser: middlewareFn|requestHandler,
  findUsernames: middlewareFn|requestHandler,
  getAccessLists: middlewareFn|requestHandler,
  subscription: middlewareFn|requestHandler,
  getSubscriptions: middlewareFn|requestHandler,
  searchUsers: middlewareFn|requestHandler,
  getNotifications: middlewareFn|requestHandler,
  removeNotifications: middlewareFn|requestHandler
};
