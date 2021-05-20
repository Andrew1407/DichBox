import * as http from 'http';
import { Application as expressApp } from 'express';
import runTests from '../tests/entryTest';
import configureApp from './configureApp';
import ClientDB from '../database/ClientDB';
import Logger from '../logger/Logger';

export default class Server {
  private readonly server: http.Server;

  constructor(
    app: expressApp,
    private readonly port: number,
    private readonly host: string,
  ) {
    configureApp(app);
    this.server = http.createServer(app);
  }

  public start(initTests: boolean, clb?: () => void): void {
    const { port: PORT, host: HOST }: Server = this;
    const listenerClb = (): void => {
      if (initTests) runTests();
      clb?.call(null);
    };
    this.server.listen(PORT, HOST, listenerClb);
  }

  public gracefulShutdown(clb?: () => void): void {
    let exitCode: 0|1 = 0;
    const onExit = (): void => process.exit(exitCode);
    this.server.close((err?: Error) => {
      if (err) { 
        console.error(err);
        exitCode = 1;
      };
      ClientDB.getInstance().closePool();
      Logger.closeWriteStream();
      clb?.call(null);
      onExit();
    });
    setInterval(onExit, 1000).unref();
  }
}
