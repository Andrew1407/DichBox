import { BoxData } from '../../datatypes';

export default interface IBoxesClientDB {
  removeBox(id: number): Promise<void>;
  findUserBox(username: string, boxName: string): Promise<BoxData|null>;
  getUserBoxIds(username: string, boxName: string): Promise<[number, number]|null>;
  getUserId(name: string): Promise<number|null>;

  getBoxesList(
    viewerName: string,
    boxOwnerName: string,
    follower: boolean
  ): Promise<BoxData[]|null>;

  getBoxInfo(
    boxName: string,
    viewerName: string,
    ownerName: string,
    follower: boolean,
  ): Promise<BoxData|null>;

  insertBox(
    ownerName: string,
    BoxData: BoxData,
    limitedUsers: string[]|null,
    editors: string[]|null
  ): Promise<BoxData|null>;

  updateBox(
    ownerName: string,
    boxName: string,
    BoxData: BoxData,
    limitedlist?: string[]|null,
    editorslist?: string[]|null
  ): Promise<BoxData|null>;

  checkBoxAccess(
    ownerName: string,
    viewerName: string,
    boxName: string,
    follower: boolean,
    editor?: boolean
  ): Promise<[number, number]|null>;
}
