import ITester from './ITester';
import AdditionalTest from './additional/AdditionalTest';
import DatabaseTest from './database/DatabaseTest';
import FileSystemTest from './fileSystem/FileSystemTest';
import RouterTest from './routes/RouterTest';
import UserRouterTest from './routes/testClasses/UserRouterTest';
import { testBox, testUser } from './testData/routes';

(async () => {
  const tadditional: ITester = new AdditionalTest();
  await tadditional.test();
  await tadditional.run();

  const tdatabase: ITester = new DatabaseTest();
  await tdatabase.test();
  await tdatabase.run();

  const tfilesystem: ITester = new FileSystemTest();
  await tfilesystem.test();
  await tfilesystem.run();

  const troutes: ITester = new RouterTest();
  await troutes.test();
  await troutes.run();
})();
