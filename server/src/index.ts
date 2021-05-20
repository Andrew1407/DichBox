import * as cluster from 'cluster';
import { cpus } from 'os';
import * as dotenv from 'dotenv';
import * as express from 'express';
import IServer from './app/IServer';
import Server from './app/Server';
import Colors from './logger/colors';

dotenv.config();

const PORT: number = Number(process.env.PORT) || 7041;
const HOST: string = process.env.HOST || 'localhost';
const testFlag: string = '--test-worker';
const includeTestWorker: boolean = process.argv.includes(testFlag);
const TEST_WORKER: number = Number(includeTestWorker);

if (cluster.isMaster) {
  const forkCluster = (): void => {
    const worker: cluster.Worker = cluster.fork();
    const handleWorkerExit = (code: number): void => {
      if (
        code === 1 &&
        worker.id === TEST_WORKER
      ) process.exit(1);
      cluster.fork();
    };

    worker.on('exit', handleWorkerExit);
  };

  cpus().forEach(forkCluster);
} else {
  const workerId: number = cluster.worker.id;
  const runTests: boolean = workerId === TEST_WORKER;
  const font: string = Colors.MAGENTA;
  const reset: string = Colors.RESET;
  const logWorker = (message: string): void => console.log(`${font}${message} ${workerId}.${reset}`);
  const onServerStart = (): void => logWorker('The server started on the process');
  const onClusterExit = (): void => logWorker('The server was shut down on the process');
  
  const app: express.Application = express();
  const server: IServer = new Server(app, PORT, HOST);
  const shutdown = (): void => server.gracefulShutdown(onClusterExit);
  
  server.start(runTests, onServerStart);
  process.on('SIGINT', shutdown);  
  process.on('SIGTERM', shutdown);
}
