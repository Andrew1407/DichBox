import * as dotenv from 'dotenv';
import * as express from 'express';
import IServer from '../app/IServer';
import Server from '../app/Server';
import { Statuses } from '../controllers/statusInfo';
import ClientDB from '../database/ClientDB';
import Logger from '../logger/Logger';
import Colors from '../logger/colors';
import runTests from './entryTest';
import makeRequest from './routes/requestHandler';

dotenv.config();

const onExit = (): void => {
  ClientDB.getInstance().closePool();
  Logger.closeWriteStream();
  process.exit(0);
};

const runServer = (): void => {
  const PORT: number = Number(process.env.PORT) || 7041;
  const HOST: string = process.env.HOST || 'localhost';
  const app: express.Application = express();
  const server: IServer = new Server(app, PORT, HOST);
  const shutdown = (): void => server.gracefulShutdown(onExit);
  const runFlag: boolean = true;
  server.start(runFlag, onExit);
  process.on('SIGINT', shutdown);  
  process.on('SIGTERM', shutdown);
};

(async (): Promise<void> => {
  const checkRoute: string = '/health';
  const messageErr: string = 'connection failed';
  try {
    const { status }: { status: number } = await makeRequest(checkRoute, {});
    if (status === Statuses.OK) await runTests().then(onExit);
    else throw new Error(messageErr);
  } catch(e) {
    const noConnection: string = 'ECONNREFUSED';
    if (e.code === noConnection) {
      runServer();
    } else {
      const err: Error = new Error(messageErr);
      console.error(Colors.BG_BLACK, Colors.FG_RED, err, Colors.RESET);
      process.exit(1);
    }
  }
})();
