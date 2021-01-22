import * as http from 'http';
import * as dotenv from 'dotenv';
import { Application as expressApp } from 'express';
import runTests from '../tests/entryTest';
import clientConnection from '../controllers/clientConnection';
import configureApp from './configureApp';

dotenv.config();

export default class Server {
  private server: http.Server

  constructor(app: expressApp) {
    configureApp(app);
    this.server = http.createServer(app);
  }

  public start(initTests: boolean): void {
    const PORT: number = Number(process.env.PORT) || 7041;
    const HOST: string = process.env.HOST || 'localhost';
    const listenArgs: any[] = initTests ? [PORT, HOST, runTests] : [PORT, HOST];
    this.server.listen(...listenArgs);
  }

  public handleShutdown(clb?: () => void): void {
    const onExitClb = (): void => {
      this.server.close((err?: Error) => {
        if (err) console.error(err);
        clientConnection.closePool();
        if (clb) clb();
        process.exit(0);
      });

      setTimeout((): void => {
        process.exit(0);
      }, 1000).unref();
    };
    
    process.on('SIGINT', onExitClb);
    process.on('SIGTERM', onExitClb);
  }
}
