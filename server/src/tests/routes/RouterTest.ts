import ITester from '../ITester';
import UserRouterTest from './testClasses/UserRouterTest';
import BoxesRouterTest from './testClasses/BoxesRouterTest';
import { testUser, testBox } from '../testData/routes';
import { BoxData, UserData } from '../../datatypes';

export default class RouterTest implements ITester {
  private userRouter: UserRouterTest;
  private boxesRouter: BoxesRouterTest;

  constructor() {
    const user: UserData[] = testUser
      .map(x => ({ ...x }));
    const box: BoxData = { ...testBox };
    this.userRouter = new UserRouterTest(user, box);
    this.boxesRouter = new BoxesRouterTest(user, box);
  }

  public async test(): Promise<void> {
    await this.userRouter.testSignInUp();
    await this.userRouter.testEdit();
    await this.userRouter.testVerify();
    await this.userRouter.testSubscriptions();
    await this.userRouter.testSearch();
    await this.userRouter.testNotifications();
    await this.boxesRouter.testBoxData();
    await this.userRouter.testAccessList();
    await this.boxesRouter.testEditBox();
    await this.boxesRouter.testFiles();
    await this.boxesRouter.testRemoveBox();
    await this.userRouter.testRemoveUser();
  }

  public async run(): Promise<void> {
    console.log('Routes tests:');
    await Promise.all([
      this.userRouter.run(),
      this.boxesRouter.run()
    ]);
  }
}