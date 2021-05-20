import { Request, Response } from 'express';
import * as path from 'path';
import * as dotenv from 'dotenv';
import ILogger from './logger/ILogger';
import Logger from './logger/Logger';

dotenv.config();

const logDir: string = process.env.LOG_DIR || 'logs';
const printable: boolean = process.env.VERBOSE?.toLowerCase() === 'true';
const logger: ILogger = new Logger(logDir, printable);

export const viewPath: string = path.join(__dirname, '..', 'dist', 'view');

export const getViewHandler = (req: Request, res: Response): void => {
  const root: string = viewPath;
  const viewEntry: string = 'index.html';
  logger.log({
    date: new Date().toLocaleString(),
    method: req.method,
    route: req.url,
    status: res.statusCode
  });
  res.sendFile(viewEntry, { root });
};
