import TestLogger from '../../TestLogger';
import makeRequest from '../requestHandler';
import { UserData, BoxData } from '../../../datatypes';
import { Statuses, ErrorMessages } from '../../../controllers/statusInfo';

export default class BoxesRouterTest extends TestLogger { 
  constructor(
    private readonly testUsers: UserData[],
    private readonly testBox: BoxData
  ) { super() }

  public async run(): Promise<void> {
    const testName: string = 'Boxes routes test';
    this.logAndCheck(testName);
  }

  public async testBoxData(): Promise<void> {
    const owner_name: string = this.testUsers[0].name;
    const owner_nc: string = this.testUsers[0].name_color;
    const viewerName: string = this.testUsers[1].name;
    const { name, name_color, access_level, description } = this.testBox;
    const argData: [string, any, any][] = [
      [
        '/boxes/create',
        {
          boxData: this.testBox,
          username: owner_name,
          logo: null,
          limitedUsers: null,
          editors: null
        },
        { status: Statuses.CREATED, body: { name } }
      ],
      [
        '/boxes/user_boxes',
        { viewerName, boxOwnerName: owner_name },
        { status: Statuses.OK, body: {
            boxesList: [{ owner_name, name, name_color, access_level }]
          }
        }
      ],
      [
        '/boxes/verify',
        { username: owner_name, boxName: name },
        { status: Statuses.OK, body: { foundValue: name } }
      ],
      [
        '/boxes/verify',
        { username: owner_name, boxName: '' },
        { status: Statuses.OK, body: { foundValue: null } }
      ],
      [
        '/boxes/details',
        {
          ownerName: owner_name,
          viewerName,
          boxName: name 
        },
        { status: Statuses.OK, body: {
            name, name_color, owner_name, owner_nc, description,
            access_level, editor: false, logo: null 
          }
        }
      ],
      [
        '/boxes/details',
        {
          ownerName: owner_name,
          viewerName,
          boxName: '' 
        },
        { 
          status: Statuses.NOT_FOUND,
          body: { msg: ErrorMessages.BOXES_NOT_FOUND }
        }
      ]
    ];
    for (const [route, arg, exp] of argData) {
      const res: any = await makeRequest(route, arg);
      const body: any = this.excludeFields(res.body, exp.body);
      this.check({ status: res.status, body }, exp);
    }
  }

  public async testEditBox(): Promise<void> {
    const boxName: string = this.testBox.name;
    const name: string = 'new_test_box_name';
    const username: string = this.testUsers[0].name;
    this.testBox.name = name;
    const {
      description,
      name_color,
      description_color,
      access_level
    } = this.testBox;
    const updateArg: [any, any][] = [
      [
        {
          username, 
          logo: null,
          limitedList: null,
          editorsList: null,
          boxData: this.testBox,
          boxName
        },
        {
          status: Statuses.OK,
          body: {
            name, description, name_color,
            description_color, access_level
          }
        }
      ],
      [
        {
          username, 
          logo: null,
          limitedList: null,
          editorsList: null,
          boxData: this.testBox,
          boxName: ''
        },
        {
          status: Statuses.BAD_REQUEST,
          body: { msg: ErrorMessages.BOXES_INVAID_REQUEST }
        }
      ]
    ];
    for (const [arg, exp] of updateArg) {
      const res: any = await makeRequest('/boxes/edit', arg);
      const body: any = this.excludeFields(res.body, exp.body);
      this.check({ status: res.status, body }, exp);
    }
  }

  public async testFiles(): Promise<void> {
    const viewerName: string = this.testUsers[0].name;
    const boxPath: string[] = [viewerName, this.testBox.name];
    const fileName: string = 'test_file.txt';
    const type: string = 'file';
    const src: string = 'test';
    const newName: string = 'new_test_file.txt';
    const invalidPath: string[] = [...boxPath, '..'];
    const filePathStr: string = [...boxPath, fileName].join('/');

    const forbiddenObj: any = {
      status: Statuses.FORBIDDEN,
      body: { msg: ErrorMessages.FORBIDDEN },
    };
    const invalidPathObj: any = {
      status: Statuses.NOT_FOUND,
      body: { msg: ErrorMessages.INVALID_PATH }
    };
    const internalErrObj: any = {
      status: Statuses.SERVER_INTERNAL,
      body: { msg: ErrorMessages.BOXES_INTERNAL }
    };
    const templateArgs: any = {
      viewerName, fileName,
      follower: false, editor: false,
    };

    const updateArg: [string, any, any][] = [
      [
        '/boxes/files/create',
        { ...templateArgs, boxPath: invalidPath, type },
        invalidPathObj
      ],
      [
        '/boxes/files/create',
        { ...templateArgs, boxPath, type },
        {
          status: Statuses.CREATED,
          body: { created: {
              type, file: {
                src: [ { name: fileName, type } ],
                name: fileName
              }
            }
          }
        }
      ],
      [
        '/boxes/files/list',
        { boxPath, ...templateArgs, initial: false },
        {
          status: Statuses.OK,
          body: {
            entries: { dir: {
                src: [ { name: fileName, type } ],
                name: 'хрін тобі'
              }, type: 'dir'
            }
          }
        }
      ],
      [
        '/boxes/files/list',
        {
          boxPath: invalidPath, ...templateArgs, initial: false },
        {
          status: Statuses.NOT_FOUND,
          body: { msg: ErrorMessages.DIR_NOT_FOUND },
        }
      ],
      [
        '/boxes/files/save',
        {
          editorName: viewerName,
          files: [{ src, filePathStr: `/${filePathStr}` }]
        },
        {
          status: Statuses.OK,
          body: { edited: true },
        }
      ],
      [
        '/boxes/files/save',
        {
          editorName: viewerName,
          files: [{ src, filePathStr }]
        }, forbiddenObj
      ],
      [
        '/boxes/files/save',
        {
          editorName: viewerName,
          files: [{ src, filePathStr: `/${filePathStr}/invalid` }]
        }, internalErrObj
      ],
      [
        '/boxes/files/get',
        {
          boxPath, viewerName, type, fileName
        },
        {
          status: Statuses.OK,
          body: { foundData: src, found: true }
        }
      ],
      [
        '/boxes/files/get',
        {
          boxPath: [...boxPath, '..'], viewerName, type, fileName
        }, invalidPathObj
      ],
      [
        '/boxes/files/rename',
        { ...templateArgs, boxPath, newName },
        { status: Statuses.OK, body: { renamed: true} }
      ],
      [
        '/boxes/files/rename',
        { ...templateArgs, boxPath: invalidPath, newName },
        {
          status: Statuses.NOT_FOUND,
          body: { msg: ErrorMessages.FILES_NOT_FOUND }
        }
      ],
      [
        '/boxes/files/remove',
        {
          boxPath: invalidPath, viewerName,
          fileName: newName, type,
          follower: false, editor: false
        }, invalidPathObj
      ],
      [
        '/boxes/files/remove',
        {
          boxPath: [...boxPath, 'invalid'],
          viewerName, fileName: newName,
          type, follower: false, 
          editor: false
        }, internalErrObj
      ],
      [
        '/boxes/files/remove',
        {
          boxPath, viewerName, fileName: newName,
          type, follower: false, 
          editor: false
        },
        { status: Statuses.OK, body: { removed: true } }
      ]
    ];
    for (const [route, arg, exp] of updateArg) {
      const res: any = await makeRequest(route, arg);
      const body: any = this.excludeFields(res.body, exp.body);
      this.check({ status: res.status, body }, exp);
    }
  }

  public async testRemoveBox(): Promise<void> {
    const username: string = this.testUsers[0].name;
    const forbiddenObj: any = {
      status: Statuses.FORBIDDEN, 
      body: { msg: ErrorMessages.FORBIDDEN }
    }
    const removeArgs: [any, any][] = [
      [
        { username, boxName: this.testBox.name, ownPage: true },
        forbiddenObj
      ],
      [
        {
          confirmation: 'permitted',
          username,
          boxName: this.testBox.name,
          ownPage: false
        }, forbiddenObj
      ],
      [
        {
          confirmation: 'permitted',
          username,
          boxName: '',
          ownPage: false
        }, forbiddenObj
      ],
      [
        {
          confirmation: 'permitted',
          username,
          boxName: this.testBox.name,
          ownPage: true
        },
        { status: Statuses.OK, body: { removed: true } }
      ]
    ]
    for (const [arg, exp] of removeArgs) {
      const res: any = await makeRequest('/boxes/remove', arg);
      this.check(res, exp);
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
    return (statusEqual && bodyEqual) ? null :
      new Error(errMsg);
  }
}
