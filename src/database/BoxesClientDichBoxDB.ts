import { QueryResult } from 'pg';
import ClientDichBoxDB from './ClientDichBoxDB';
import { boxData, boxInput } from '../datatypes';


export default class BoxesClientDichBoxDB extends ClientDichBoxDB {
  public async getBoxesList(
    userId: number,
    ownPage: boolean,
    follower: boolean = false
  ): Promise<boxInput[]|null> {
    let boxesList: boxInput[]|null;
    if (ownPage) {
      const userBoxes: boxInput[]|null = await this.getUserOwnBoxes(userId);
      const inveteeBoxes: boxInput[]|null = await this.getUserInveteeBoxes(userId);
      boxesList = (userBoxes || inveteeBoxes) ? 
        [ ...userBoxes, ...inveteeBoxes ] : null;
    } else {
      boxesList = await this.getVisitorBoxes(userId, follower);
    }
    return boxesList;
  }

  private async getUserOwnBoxes(id: number): Promise<boxInput[]|null> {
    const res: QueryResult = await this.poolClient.query(
      'select name, name_color, access_level from boxes where owner_id = $1;',
      [id]
    );
    const userBoxes: boxInput[]|null = res.rowCount ?
      res.rows : null;
    return userBoxes;
  }

  private async getVisitorBoxes(
    id: number,
    follower: boolean
  ): Promise<boxInput[]|null> {
    const boxesAccess = follower ?
      '(access_level = \'public\' or access_level = \'followers\');' :
      'access_level = \'public\';';
    const res: QueryResult = await this.poolClient.query(
      'select name, name_color, access_level from boxes where owner_id = $1 and ' + boxesAccess,
      [id]
    );
    const visitorBoxes: boxInput[]|null = res.rowCount ?
      res.rows : null;
    return visitorBoxes;
  }

  private async getUserInveteeBoxes(id: number): Promise<boxInput[]|null> {
    const res: QueryResult = await this.poolClient.query(
      'select name, name_color, $1 as access_level from boxes b left join box_access ba on b.id = ba.box_id where ba.person_id = $2;',
      ['invetee', id]
    );
    const inveteeBoxes: boxInput[]|null = res.rowCount ?
      res.rows : null;
    return inveteeBoxes
  }

  public async insertBox(boxData: boxInput): Promise<boxData> {
    return await this.insertValue('boxes', boxData);
  }

  public async findBox(boxId: number): Promise<boxData|null> {
    return await this.findValueById('boxes', boxId);
  }

  public async removeBox(id: number): Promise<void> {
    await this.poolClient.query(
      'delete from boxes where id = $1;', [id]
    );
  }

  public async updateBox(
    id: number,
    boxData: boxInput
  ): Promise<void> {
    await this.updateValueById('boxes', id, boxData);
  }

  // privacy setting up

  private async addUserToBox(
    id: number,
    access_modifiers: ['read'?, 'write'?]
  ): Promise<void> {
    await this.poolClient.query(
      'insert into box_access (privileges) values ($1) where id = $2;',
      [access_modifiers, id]
    );
  }

  public async removeUserFromBox (
    boxId: number,
    userId: number
  ): Promise<void> {
    await this.poolClient.query(
      'delete from box_access where box_id = $1 and person_id = $2;',
      [boxId, userId]
    );
  }

  public async switchAccess(
    boxId: number,
    access_level: 'public'|'private'|'limited',
    limited: [
      number,               // userId
      ['read'?, 'write'?]   //access_modifiers
    ] = [-1, []]
  ): Promise<void> {
    await this.poolClient.query(
      'update boxes set access_level = $1 where id = $2;',
      [access_level, boxId]
    );
    if (access_level === 'limited')
      await this.addUserToBox(...limited);
    else
      await this.poolClient.query(
        'delete from box_access where box_id = $1;', [boxId]
      );
  }
}