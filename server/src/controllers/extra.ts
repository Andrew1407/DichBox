import { Response, Request } from 'express';
import * as dotenv from 'dotenv';
import ILogger from '../logger/ILogger';
import Logger from '../logger/Logger';
import { BoxesRoutes, middlewareFn, requestHandler, responseTuple, UserRoutes } from './routesTypes';
import { Statuses, ErrorMessages } from './statusInfo';
import LogInfo from '../logger/LogInfo';

dotenv.config();

type errorContainer = { msg: string };

const logDir: string = process.env.LOG_DIR || 'logs';
const printable: boolean = process.env.VERBOSE?.toLowerCase() === 'true';
const logger: ILogger = new Logger(logDir, printable);

const sendResponse = (res: Response, status: number, json: unknown): void => {
  res.status(status).json(json).end();
};

const checkInvalidPath = (dirPath: string): boolean => {
  const isDots: RegExp = /^(\.)+$/;
  if (isDots.test(dirPath)) return true;
  const hasSlashesDots: RegExp = /((\/)|((\/)(\.)+)|((\.)+)(\/))/;
  return hasSlashesDots.test(dirPath);
};

export const makeTuple = (st: number, obj: unknown): responseTuple => [st, obj];

export const checkPathes = (pathes: string[][]): boolean => {
  for (const p of pathes)
    for (const dir of p) {
      const invalidPath: boolean = checkInvalidPath(dir);
      if (invalidPath) return false;
    }
  return true;
};

export const getWrappedRoutes = (handlers: BoxesRoutes|UserRoutes): any => {
  const wrappedRoutes: unknown = {};
  for (const fnName in handlers) {
    const handler: requestHandler = handlers[fnName];
    const middleware: middlewareFn = async (req: Request, res: Response) => {
      let logData: LogInfo;
      try {
        const result: responseTuple = await handler(req);
        const status: number = result[0] as number;
        logData = {
          date: new Date().toLocaleString(),
          method: req.method,
          route: req.url,
          status: result[0]
        };
        if (!(status === Statuses.OK || status === Statuses.CREATED)) {
          const { msg }: errorContainer = result[1] as errorContainer;
          logData.errorMessage = msg;
        }
        sendResponse(res, ...result);
      } catch(e) {
        const msg: string = ErrorMessages.SERVER_INTERNAL;
        logData = {
          date: new Date().toLocaleString(),
          method: req.method,
          route: req.url,
          status: Statuses.SERVER_INTERNAL,
          errorMessage: msg,
          errorMessageInternal: e.message
        };
        sendResponse(res, Statuses.SERVER_INTERNAL, { msg });
      } finally {
        logger.log(logData);
      }
    };
    wrappedRoutes[fnName] = middleware;
  }
  return wrappedRoutes;
};
