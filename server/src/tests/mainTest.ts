import ITester from './ITester';
import AdditionalTest from './additional/AdditionalTest';

(async () => {
  const tadditional: ITester = new AdditionalTest();
  await tadditional.test();
  await tadditional.run();
})();
