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

  public start(initTests: boolean): void {
    const PORT: number = Number(process.env.PORT) || 7041;
    const HOST: string = process.env.HOST || 'localhost';
    const listenArgs: any[] = [PORT, HOST];
    if (initTests)
      listenArgs.push(runTests);
    this.server.listen(...listenArgs);
  }

  public handleShutdown(clb?: () => void): void {
    const onExitClb = (): void => {
      this.server.close((err?: Error) => {
        if (err) console.error(err);
        ClientDB
          .getInstance()
          .closePool();
        if (clb) clb();
        process.exit(0);
      });

      setInterval((): void => {
        process.exit(0);
      }, 1000).unref();
    };
    
    process.on('SIGINT', onExitClb);
    process.on('SIGTERM', onExitClb);
  }
}
