import { Response, Request } from 'express';
import { middlewareFn, requestHandler, responseTuple } from './routesTypes';
import { statuses, errMessages } from './statusInfo';

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

export const getMiddlewares = (handlers: any): any => {
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
