import ITester from '../ITester';
import UserRouterTest from './testClasses/UserRouterTest';
import BoxesRouterTest from './testClasses/BoxesRouterTest';
import { testUser, testBox } from '../testData/routes';
import { BoxData, UserData } from '../../datatypes';
import Colors from '../../logger/colors';

export default class RouterTest implements ITester {
  private readonly userRouter: UserRouterTest;
  private readonly boxesRouter: BoxesRouterTest;

  constructor() {
    const users: UserData[] = testUser.map(
      (obj: UserData): UserData => ({ ...obj })
    );
    const box: BoxData = { ...testBox };
    this.userRouter = new UserRouterTest(users, box);
    this.boxesRouter = new BoxesRouterTest(users, box);
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
    console.log(Colors.BG_BLACK, Colors.FG_BLUE, 'Routes tests:', Colors.RESET);
    await Promise.all([
      this.userRouter.run(),
      this.boxesRouter.run()
    ]);
  }
}
