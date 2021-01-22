import * as cluster from 'cluster';
import { cpus } from 'os';
import * as express from 'express';
import Server from './app/Server';

const TEST_WORKER: number = 1;

if (cluster.isMaster) {
  const forkCluster = (): void => {
    cluster.fork();
  };

  cpus().forEach(forkCluster);
  cluster.on('exit', forkCluster);
} else {
  const workerId: number = cluster.worker.id;
  const runTests: boolean = workerId === TEST_WORKER;
  const onClusterExit = (): void => {
    console.log(`The server was shuted down on the process: ${workerId}`);
  };
  
  const app: express.Application = express();
  const server: Server = new Server(app);
  
  server.start(runTests);
  server.handleShutdown(onClusterExit);
}
