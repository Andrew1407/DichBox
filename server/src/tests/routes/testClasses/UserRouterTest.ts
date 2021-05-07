import TestLogger from '../../TestLogger';
import makeRequest from '../requestHandler';
import { UserData, BoxData } from '../../../datatypes';
import { Statuses, ErrorMessages } from '../../../controllers/statusInfo';

export default class UserRouterTest extends TestLogger {
  constructor(
    private readonly testUsers: UserData[],
    private readonly testBox: BoxData
  ) { super() }

  public async run(): Promise<void> {
    const testName: string = 'User routes test';
    this.logAndCheck(testName);
  }

  public async testSignInUp(): Promise<void> {
    for (const user of this.testUsers) {
      const { name, email, passwd } = user;
      const newUser: UserData = { name, email, passwd };
      const body: any = { name };
      const routesExp: any = {
        '/users/create': { status: Statuses.CREATED, body },
        '/users/enter': { status: Statuses.OK, body }
      };
      for (const [route, exp] of Object.entries(routesExp)) {
        const res: any = await makeRequest(route, newUser);
        this.check(res, exp);
      }
    }

    const invalidArgs: [string, any, any][] = [
      ['/users/create', this.testUsers[0],
        {
          status: Statuses.BAD_REQUEST,
          body: { msg: ErrorMessages.USER_INVAID_REQUEST }
        }
      ],
      ['/users/enter', { email: '', passwd: ''},
        {
          status: Statuses.NOT_FOUND, 
          body: { msg: ErrorMessages.USER_NOT_FOUND }
        }
      ],
      ['/users/enter', { email: this.testUsers[0].email, passwd: ''},
        {
          status: Statuses.BAD_REQUEST, 
          body: { msg: ErrorMessages.INVALID_PASSWORD }
        }
      ]
    ];
    for (const [route, arg, exp] of invalidArgs) {
      const res: any = await makeRequest(route, arg)
      this.check(res, exp);
    }
  }

  public async testEdit(): Promise<void> {
    for (const user of this.testUsers) {
      const { name, name_color, description } = user;
      const edited: UserData = { name_color, description };
      const editRes: any = await makeRequest(
        '/users/edit',
        { username: name, edited, logo: null }
      );
      const editExp: any = { status: Statuses.OK, body: edited };
      this.check(editRes, editExp);
    }
  }

  public async testVerify(): Promise<void> {
    const { name, passwd } = this.testUsers[0];
    const verifyArgs: [string, any, any][] = [
      [
        '/users/passwd_verify', { username: name, passwd },
        { status: Statuses.OK, body: { checked: true } }
      ],
      [
        '/users/passwd_verify', { username: name, passwd: 'wrong_pass' },
        { status: Statuses.OK, body: { checked: false } }
      ],
      [
        '/users/verify', { inputField: 'name', inputValue: name },
        { status: Statuses.OK, body: { foundValue: name } }
      ],
      [
        '/users/verify', { inputField: 'email', inputValue: '' },
        { status: Statuses.OK, body: { foundValue: null } }
      ]
    ];
    for (const [ route, arg, exp ] of verifyArgs) {
      const res: any = await makeRequest(route, arg);
      this.check(res, exp);
    }
  }

  public async testSubscriptions(): Promise<void> {
    const personName: string = this.testUsers[0].name;
    const subscriptionName: string = this.testUsers[1].name;
    const name_color: string = this.testUsers[1].name_color;
    const subObj: any = {
      status: Statuses.OK,
      body: { followers: 1, follower: true }
    };
    const subArg: any[] = [
      [
        '/users/subscription',
        {
          action: 'subscribe',
          personName,
          subscriptionName,
          responseValues: true
        }, subObj
      ],
      [
        '/users/subscription',
        {
          action: 'subscribe',
          personName: subscriptionName,
          subscriptionName: personName,
          responseValues: true
        }, subObj],
      [
        '/users/subscription',
        {
          action: 'subscribe', personName: '',
          subscriptionName, responseValues: true
        },
        {
          status: Statuses.NOT_FOUND,
          body: { msg: ErrorMessages.SUBSCRIPTIONS_NOT_FOUND }
        }
      ],
      [
        '/users/subs_list', { name: personName },
        { 
          status: Statuses.OK,
          body: {
            subs: [ { name: subscriptionName, name_color, logo: null } ]
          }
        }
      ],
      [
        '/users/subs_list', { name: '' },
        {
          status: Statuses.NOT_FOUND,
          body: { msg: ErrorMessages.USER_NOT_FOUND }
        }
      ],
      [
        '/users/subscription',
        {
          action: 'unsubscribe',
          personName,
          subscriptionName,
          responseValues: true
        }, {
          status: Statuses.OK,
          body: { followers: 0, follower: false }
        }
      ],
      [
        '/users/subscription',
        {
          action: 'unsubscribe',
          personName: subscriptionName,
          subscriptionName: personName,
          responseValues: false
        }, {
          status: Statuses.OK,
          body: { unsubscribed: true }
        }
      ]
    ];
    for (const [ route, arg, exp ] of subArg) {
      const res: any = await makeRequest(route, arg);
      this.check(res, exp);
    }
  }

  public async testSearch(): Promise<void> {
    const pathName: string = this.testUsers[0].name;
    const { name_color, email, description } = this.testUsers[0];
    const username: string = this.testUsers[1].name;
    const resTemplate: any = {
      name: pathName,
      name_color,
      email,
      description,
      logo: null
    }
    const searchArgs: any[] = [
      [
        '/users/find',
        { pathName, username },
        {
          status: Statuses.OK,
          body: { ...resTemplate,
            follower: false,
            ownPage: false
          }
        }
      ],
      [
        '/users/find',
        { pathName, username: pathName },
        {
          status: Statuses.OK,
          body: { ...resTemplate,
            follower: false,
            ownPage: true
          }
        }
      ],
      [
        '/users/find',
        { pathName: '', username },
        {
          status: Statuses.NOT_FOUND,
          body: { msg: ErrorMessages.USER_NOT_FOUND }
        }
      ],
      [
        '/users/names_list',
        { nameTemplate: 'test_user', username },
        {
          status: 200,
          body: {
            foundUsers: [ { name: pathName, name_color, logo: null } ]
          }
        }
      ],
      [
        '/users/search',
        { searchStr: 'test_user' },
        {
          status: 200,
          body: {
            searched: [
              {
                name: username,
                name_color: this.testUsers[1].name_color,
                logo: null
              },
              { name: pathName, name_color, logo: null }
            ]
          }
        }
      ],
    ];
    for (const [route, arg, exp] of searchArgs) {
      const res: any = await makeRequest(route, arg);
      const body: any = this.excludeFields(res.body, exp.body);
      this.check({ status: res.status, body }, exp);
    }
  }

  public async testNotifications(): Promise<void> {
    const { name } = this.testUsers[0];
    const ntsArgs: any[] = [
      [
        '/users/notifications_list',
        { name },
        {
          status: Statuses.OK,
          body: { notifications: [
              { type: 'helloMsg', icon: null }
            ]
          }
        }
      ],
      [
        '/users/notifications_remove',
        { username: name, ntsIds: [] },
        {
          status: Statuses.OK,
          body: { removed: true }
        }
      ],
    ]
    for (const [route, arg, exp] of ntsArgs) {
      let res: any = await makeRequest(route, arg);
      if (route === '/users/notifications_list') {
        const id: number = res.body.notifications[0].id;
        ntsArgs[1][1].ntsIds.push(id);
        const nts: any = this.excludeFields(
          res.body.notifications[0],
          exp.body.notifications[0]);
        res.body.notifications[0] = nts;
      }
      this.check(res, exp);
    }
  }

  public async testAccessList(): Promise<void> {
    const res: any = await makeRequest('/users/access_lists', 
      {
      username: this.testUsers[0].name,
      boxName: this.testBox.name
      }
    );
    const exp: any = {
      status: Statuses.OK,
      body: { limitedUsers: [], editors: [] }
    };
    this.check(res, exp);
  }

  public async testRemoveUser(): Promise<void> {
    const invalidArgs: any[] = [
      { username: '', confirmation: 'permitted' },
      { username: this.testUsers[0].name }
    ];
    const expectedRes: any = {
      status: Statuses.FORBIDDEN,
      body: { msg: ErrorMessages.FORBIDDEN }
    };
    for (const arg of invalidArgs) {
      const invalidRes = await makeRequest('/users/remove', arg);
      this.check(invalidRes, expectedRes);
    }
    const expectedRem: any = {
      status: Statuses.OK,
      body: { removed: true }
    };
    for (const user of this.testUsers) {
      const { name } = user;
      const permitted: any = { username: name, confirmation: 'permitted' };
      const result: any = await makeRequest('/users/remove', permitted);
      this.check(result, expectedRem);
    }
  }

  private excludeFields(input: any, expected: any): any {
    const expectedKeys: string[] = Object.keys(expected);
    const inputKeys: string[] = Object.keys(input);
    const filteredKeys: string[] = inputKeys.filter(
      (key: string): boolean =>
        expectedKeys.includes(key) && key !== 'password'
    );
    const res: any = {};
    for (const key of filteredKeys)
      res[key] = input[key];
    return res;
  }

  private check(result: any, expected: any): void {
    const res: Error|null = this.equals(result, expected);
    this.addTestResult(res);
  }

  private equals(result: any, expected: any): Error|null {
    const resultStr: string = JSON.stringify(result);
    const expectedStr: string = JSON.stringify(expected);
    const errMsg: string = `FAILED. Incorrect result - expected:\n"${expectedStr}",\ngot:\n"${resultStr}"`;
    const statusEqual: boolean = result.status === expected.status;
    const bodyExpStr: string = JSON.stringify(expected.body);
    const bodyResStr: string = JSON.stringify(result.body);
    const bodyEqual: boolean = bodyExpStr === bodyResStr;
    return (statusEqual && bodyEqual) ? 
      null : new Error(errMsg);
  }
}
