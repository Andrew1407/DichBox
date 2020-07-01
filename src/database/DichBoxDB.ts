import { Pool, PoolClient, QueryResult } from 'pg';
import { userData, userInput, boxData, boxInput, dataElement, entryData, entryInput } from './datatypes'

export default class DichBoxDB {
  private pool: Pool;
  private poolClient!: PoolClient;
  
  constructor() {
    this.pool = new Pool({
      host: 'localhost',
      user: 'andrew1407',
      password: 'sasik',
      database: 'dich_box'
    });
  }

  private formatData(data: userInput|boxInput|entryInput): 
    [string[], dataElement[], string[]] {
      const keys: string[] = Object.keys(data);
      const values: any[] = Object.values(data);
      const valuesTemplate: string[] = [];
      for (let i = 1; i <= values.length; i++)
        valuesTemplate.push(`$${i}`);
      return [ keys, values, valuesTemplate ];
    }

  public async clientConnection(): Promise<void> {
    this.poolClient = await this.pool.connect();
  }

  // users connetion

  public async insertUser(userData: userInput): Promise<userData> {
    const [ keys, values, valuesTemplate ]: 
      [string[], dataElement[], string[]] =
      this.formatData(userData);
    const res: QueryResult = await this.poolClient.query(
      `insert into users (${keys}) values (${valuesTemplate}) returning *;`,
      values
    );
    return res.rows[0];
  }

  public async updateUser(id: number, userData: userInput): Promise<void> {
    const [ keys, values, valuesTemplate ]: 
      [string[], dataElement[], string[]] =
      this.formatData(userData);
    const updated: string[] = [];
    for (let i = 0; i < keys.length; i++)
      updated.push(keys[i] + ' = ' + valuesTemplate[i]);
    await this.poolClient.query(
      `update users set ${updated} where id = ${id};`, values
    );
  }

  public async findUser(userId: number): Promise<userData|null> {
    const res: QueryResult = await this.poolClient.query(
      'select * from users where id = $1;', [userId]
    );
    return res.rows.length ? res.rows[0] : null;
  }

  public async findUserName(username: string): Promise<number> {
    const res: QueryResult = await this.poolClient.query(
      'select * from users where name = $1;', [username]
    );
    return res.rows.length ? res.rows[0].id : -1;
  }

  public async findUserEmail(email: string): Promise<number> {
    const res: QueryResult = await this.poolClient.query(
      'select * from users where email = $1;', [email]
    );
    return res.rows.length ? res.rows[0].id : -1;
  }


  public async removeUser(id: number): Promise<void> {
    await this.poolClient.query(
      'delete from users where id = $1;' +
      'update users set followers = (followers - 1) where \'{$1}\' <@ distributorsarr;' + 
      'update users set subscriptions = array_remove(subscriptions, $1) where \'{$1}\' <@ subscriptions;',
      [id]
    );
  }

  // description insertions

  public async setDescription(
    database: string,
    data: string,
    dataId: number
  ): Promise<void> {
      await this.poolClient.query(
        `update ${database} set description = $1; where id = $2;`, 
        [data, dataId]
      );
  }


  // subscribrers: insert/remove

  public async subscribersQuery(
    queryType: 'remove'|'insert',
    followerId: number,
    userId: number
  ): Promise<boolean> {
    const query: {
      insert: string,
      remove: string
    } = {
      insert:
        'update users set subscriptions = array_append(subscriptions, $2) where id = $1;' +
        'update users set followers = (followers + 1) where id = $2;',
      remove:
        'update users set subscriptions = array_remove(subscriptions, $2) where id = $1;' +
        'update users set followers = (followers - 1) where id = $2;'
    };
    const follower: userData|null = await this.findUser(followerId);
    const user: userData|null = await this.findUser(userId)
    if (!follower || !user) return false;
    await this.poolClient.query(
      query[queryType],
      [userId, followerId]
    );
    return true;
  }

  // boxes connection

  public async insertBox(boxData: boxInput): Promise<boxData> {
    const [ keys, values, valuesTemplate ]: 
      [string[], dataElement[], string[]] =
      this.formatData(boxData);
    const res: QueryResult = await this.poolClient.query(
      `insert into users (${keys}) values (${valuesTemplate}) returning *;`,
      values
    );
    return res.rows[0];
  }

  public async findBox(boxId: number): Promise<boxData|null> {
    const res: QueryResult = await this.poolClient.query(
      'select * from boxes where id = $1;', [boxId]
    );
    return res.rows.length ? res.rows[0] : null;
  }

  public async removeBox(id: number): Promise<void> {
    await this.pool.query(
      'delete from boxes where id = $1;', [id]
    );
  }

  public async updateBox(
    id: number,
    boxData: boxInput
  ): Promise<void> {
    const [ keys, values, valuesTemplate ]: 
      [string[], dataElement[], string[]] =
      this.formatData(boxData);
    const updated: string[] = [];
    for (let i = 0; i < keys.length; i++)
      updated.push(keys[i] + ' = ' + valuesTemplate[i]);
    await this.poolClient.query(
      `update boxes set ${updated} where id = ${id};`,
      values
    );
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

  // files management

  public async insertEntry(entryData: entryInput): Promise<entryData> {
    const [ keys, values, valuesTemplate ]: 
      [string[], dataElement[], string[]] =
      this.formatData(entryData);
    const res: QueryResult = await this.poolClient.query(
      `insert into box_entries (${keys}) values (${valuesTemplate}) returning *;`,
      values
    );
    return res.rows[0];
  }

  public async findEntry(id: number): Promise<entryData|null> {
    const res: QueryResult = await this.poolClient.query(
      'select * from box_entries where id = $1;', [id]
    );
    return res.rows.length ? res.rows[0] : null;
  }

  public async updateEntry(
    id: number,
    entryData: entryInput
  ): Promise<void> {
    const [ keys, values, valuesTemplate ]: 
      [string[], dataElement[], string[]] =
      this.formatData(entryData);
    const updated: string[] = [];
    for (let i = 0; i < keys.length; i++)
      updated.push(keys[i] + ' = ' + valuesTemplate[i]);
    await this.poolClient.query(
      `update box_entries set ${updated} where id = ${id};`, values
    );
  }

  public async removeEntry(id: number): Promise<void> {
    await this.poolClient.query(
      'delete from box_entries where id = $1;', [id]
    );
  }

}
