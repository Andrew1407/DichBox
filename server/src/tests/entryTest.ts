import ITester from './ITester';
import AdditionalTest from './additional/AdditionalTest';
import DatabaseTest from './database/DatabaseTest';
import FileSystemTest from './fileSystem/FileSystemTest';
import RouterTest from './routes/RouterTest';
import Colors from '../logger/colors';

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
  
  const passedMsg: string = '\nAll tests are passed. The server is ready to use.\n';
  console.log(Colors.BG_BLACK, Colors.FG_BLUE, passedMsg, Colors.RESET);
}; 

export default runTests;
