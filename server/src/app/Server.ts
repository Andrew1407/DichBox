import * as http from 'http';
import * as dotenv from 'dotenv';
import { Application as expressApp } from 'express';
import runTests from '../tests/entryTest';
import configureApp from './configureApp';
import ClientDB from '../database/ClientDB';

dotenv.config();

export default class Server {
  private readonly server: http.Server;

  constructor(app: expressApp) {
    configureApp(app);
    this.server = http.createServer(app);
  }

  public start(initTests: boolean, clb?: () => void): void {
    const PORT: number = Number(process.env.PORT) || 7041;
    const HOST: string = process.env.HOST || 'localhost';
    const listenerClb = (): void => {
      if (initTests) runTests();
      clb?.call(null);
    };
    this.server.listen(PORT, HOST, listenerClb);
  }

  public handleShutdown(clb?: () => void): void {
    const onExitClb = (): void => {
      let exitCode: 0|1 = 0;
      this.server.close((err?: Error) => {
        if (err) { 
          console.error(err);
          exitCode = 1;
        };
        ClientDB.getInstance().closePool();
        clb?.call(null);
        process.exit(exitCode);
      });

      setInterval((): void => process.exit(exitCode), 1000).unref();
    };
    
    process.on('SIGINT', onExitClb);
    process.on('SIGTERM', onExitClb);
  }
}
