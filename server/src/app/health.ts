import { Request, Response } from 'express';
import * as dotenv from 'dotenv';
import { Statuses } from '../controllers/statusInfo';
import ILogger from '../logger/ILogger';
import Logger from '../logger/Logger';

dotenv.config();

const logDir: string = process.env.LOG_DIR || 'logs';
const printable: boolean = process.env.VERBOSE?.toLowerCase() === 'true';
const logger: ILogger = new Logger(logDir, printable);

const healthCheck = (req: Request, res: Response): void => {
  res.json(null).status(Statuses.OK);
  logger.log({
    date: new Date().toLocaleString(),
    method: req.method,
    route: req.url,
    status: res.statusCode
  });
  res.end();
};

export default healthCheck;
