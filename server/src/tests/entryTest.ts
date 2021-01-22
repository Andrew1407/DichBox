import ITester from './ITester';
import AdditionalTest from './additional/AdditionalTest';
import DatabaseTest from './database/DatabaseTest';
import FileSystemTest from './fileSystem/FileSystemTest';
import RouterTest from './routes/RouterTest';
import clientConnection from '../controllers/clientConnection';

const runTests = async (): Promise<void> => {
  const tests: ITester[] = [
    new AdditionalTest(),
    new DatabaseTest(),
    new FileSystemTest(),
    new RouterTest()
  ];

  for (const test of tests) {
    await test.test();
    await test.run();
  }
  
  console.log('\nAll tests are passed. The server is ready to use.\n')
}; 

const commandArgs: string[] = process.argv;
const testArgs: string = '--run-tests';
const testsLog: boolean = commandArgs.includes(testArgs);

if (testsLog) {
  const onExit = (): void => {
    clientConnection.closePool();
    process.exit(0);
  };
  runTests().then(onExit);
}

export default runTests;
