import { Response, Request } from 'express';
import { statuses, errMessages } from './statusInfo';

export type responseTuple = [number, any];    // [status, json]
export type middlewareFn = (req: Request, res: Response) => Promise<void>;
export type requestHandler = (req: Request) => Promise<responseTuple>;
export type boxesRouters = {
  createBox?: middlewareFn|requestHandler,
  findUserBoxes?: middlewareFn|requestHandler,
  verifyBoxName?: middlewareFn|requestHandler,
  getBoxDetais?: middlewareFn|requestHandler,
  editBox?: middlewareFn|requestHandler,
  removeBox?: middlewareFn|requestHandler,
  getPathFiles?: middlewareFn|requestHandler,
  createFile?: middlewareFn|requestHandler,
  getFile?: middlewareFn|requestHandler,
  saveFiles?: middlewareFn|requestHandler,
  removeFile?: middlewareFn|requestHandler,
  renameFile?: middlewareFn|requestHandler
};
export type userRouters = {
  findUser?: middlewareFn|requestHandler,
  signUpUser?: middlewareFn|requestHandler,
  signInUser?: middlewareFn|requestHandler,
  verifyUserInput?: middlewareFn|requestHandler,
  verifyUserPassword?: middlewareFn|requestHandler,
  editUser?: middlewareFn|requestHandler,
  removeUser?: middlewareFn|requestHandler,
  findUsernames?: middlewareFn|requestHandler,
  getAccessLists?: middlewareFn|requestHandler,
  subscription?: middlewareFn|requestHandler,
  getSubscriptions?: middlewareFn|requestHandler,
  searchUsers?: middlewareFn|requestHandler,
  getNotifications?: middlewareFn|requestHandler,
  removeNotifications?: middlewareFn|requestHandler
};

export const makeTuple = (st: number, obj: any): responseTuple => [st, obj];

export const formatDate = (obj: any): void => {
  for (const key in obj)
    if (/^(reg_date|last_edited)$/.test(key))
      obj[key] = new Date(obj[key])
        .toLocaleString()
        .replace(/\//g, '.');
};

export const checkPathes = (pathes: string[][]): boolean => {
  for (const p of pathes)
    for (const dir of p) {
      const invalid: boolean =  /^(\.)+$/.test(dir) ||
        /((\/)|((\/)(\.)+)|((\.)+)(\/))/.test(dir);
      if (invalid)
        return false;
    }
  return true;
};

const sendResponse = (res: Response, status: number, json: any): void => {
  res.status(status).json(json).end();
};

export const getMiddlewares = (handlers: boxesRouters|userRouters): any => {
  const middlewares: any = {};
  for (const fnName in handlers) {
    const handler: requestHandler = handlers[fnName];
    const middleware: middlewareFn = async (req: Request, res: Response) => {
      try {
        const result: responseTuple = await handler(req);
        sendResponse(res, ...result);
      } catch {
        const msg: string = errMessages.SERVER_INTERNAL;
        sendResponse(res, statuses.SERVER_INTERNAL, { msg });
      }
    };
    middlewares[fnName] = middleware;
  }
  return middlewares;
};
