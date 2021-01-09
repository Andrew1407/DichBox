import { Response, Request } from 'express';
import { middlewareFn, requestHandler, responseTuple } from './routesTypes';
import { statuses, errMessages } from './statusInfo';

const sendResponse = (res: Response, status: number, json: Object): void => {
  res.status(status).json(json).end();
};

const checkInvalidPath = (dirPath: string): boolean => {
  const isDots: RegExp = /^(\.)+$/;
  if (isDots.test(dirPath)) return true;
  const hasSlashesDots: RegExp = /((\/)|((\/)(\.)+)|((\.)+)(\/))/;
  return hasSlashesDots.test(dirPath);
};

export const makeTuple = (st: number, obj: Object): responseTuple => [st, obj];

export const checkPathes = (pathes: string[][]): boolean => {
  for (const p of pathes)
    for (const dir of p) {
      const invalidPath: boolean = checkInvalidPath(dir);
      if (invalidPath) return false;
    }
  return true;
};

export const getMiddlewares = (handlers: Object): any => {
  const middlewares: unknown = {};
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