import * as cluster from 'cluster';
import { cpus } from 'os';
import * as express from 'express';
import Server from './app/Server';

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
  const logWorker = (message: string): void => console.log(`${message} ${workerId}.`);
  const onServerStart = (): void => logWorker('The server started on the process');
  const onClusterExit = (): void => logWorker('The server was shut down on the process');
  
  const app: express.Application = express();
  const server: Server = new Server(app);
  
  server.start(runTests, onServerStart);
  server.handleShutdown(onClusterExit);
}
