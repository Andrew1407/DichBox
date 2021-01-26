import * as dotenv from 'dotenv';
import { Pool, PoolClient, QueryResult } from 'pg';
import IClientDB from './IClientDB';
import { dataElement } from '../datatypes';

dotenv.config();

export default class ClientDB implements IClientDB {
  private static singleClient: ClientDB;

  public static getInstance(): ClientDB {
    if (!ClientDB.singleClient)
      ClientDB.singleClient = new ClientDB();
    return ClientDB.singleClient;
  }
  
  private poolClient: PoolClient;
  
  private constructor() { }

  public async openPool(): Promise<void> {
    if (!this.poolClient)
      this.poolClient = await new Pool({
        host: process.env.DB_HOST,
        user: process.env.DB_USERNAME,
        password: process.env.DB_PASSWD,
        database: process.env.DB_NAME
      }).connect();
  }

  public closePool(): void {
    if (this.poolClient)
      this.poolClient.release();
  }

  private formatData(data: any): 
    [string[], dataElement[], string[]] {
      const keys: string[] = Object.keys(data);
      if (!keys.length)
        return [ [], [], [] ];
      const values: any[] = Object.values(data);
      const valuesTemplate: string[] = [];
      for (let i = 1; i <= values.length; i++)
        valuesTemplate.push(`$${i}`);
      return [ keys, values, valuesTemplate ];
  }

  public async getUserId(name: string): Promise<number|null> {
    const res: QueryResult = await this.poolClient.query(
      'select id from users where name = $1',
      [name]
    );
    return res.rowCount ?
      res.rows[0].id : null;
  }

  public async rawQuery(query: string, args: any[] = []): Promise<any[]> {
    const res: QueryResult = await this.poolClient.query(query, args);
    return res.rows;
  }

  public async selectValues(
    table: string,
    input: any,
    output: string[] = ['*']
  ): Promise<any[]|null> {
    const [ keys, values, valuesTemplate ]: 
      [string[], dataElement[], string[]] = this.formatData(input);
    const selectSearch: string[] = [];
    for (let i = 0; i < keys.length; i++)
      selectSearch.push(keys[i] + ' = ' + valuesTemplate[i]);
    const res: QueryResult = await this.poolClient.query(
      `select ${output} from ${table} where ${selectSearch.join(' and ')};`,
      values
    );
    return res.rowCount ? res.rows : null;
  }

  public async selectJoinedValues(
    tables: string[],
    joinColumns: string[],
    input: any,
    output: string[] = ['*'],
    extraCondition: string = ''
  ): Promise<any[]> {
    const [ keys, values, valuesTemplate ]: 
      [string[], dataElement[], string[]] = this.formatData(input);
    const selectSearch: string[] = [];
    for (let i = 0; i < keys.length; i++)
      selectSearch.push(keys[i] + ' = ' + valuesTemplate[i]);
    const res: QueryResult = await this.poolClient.query(
      `select ${output} from ${tables[0]} a left join ${tables[1]} b on a.${joinColumns[0]} = b.${joinColumns[1]} where ${selectSearch.join(' and ')} ${extraCondition};`,
      values
    );
    return res.rows;
  }

  public async selectDoubleJoinedValues(
    tables: string[],
    joinConditions: string[],
    input: any,
    output: string[] = ['*'],
    extraCondition: string = ''
  ): Promise<any[]> {
    const [ keys, values, valuesTemplate ]: 
      [string[], dataElement[], string[]] = this.formatData(input);
    const selectSearch: string[] = [];
    for (let i = 0; i < keys.length; i++)
      selectSearch.push(keys[i] + ' = ' + valuesTemplate[i]);
    const res: QueryResult = await this.poolClient.query(
      `select ${output} from ${tables[0]} a left join ${tables[1]} b on ${joinConditions[0]} left join ${tables[2]} c on ${joinConditions[1]} where ${selectSearch.join(' and ')} ${extraCondition};`,
      values
    );
    return res.rows;
  }

  public async updateValueById(
    table: string,
    id: number,
    data: any,
    returning: string[] = ['*']
  ): Promise<any> {
    const [ keys, values, valuesTemplate ]: 
      [string[], dataElement[], string[]] = this.formatData(data);
    const updated: string[] = [];
    for (let i = 0; i < keys.length; i++)
      updated.push(keys[i] + ' = ' + valuesTemplate[i]);
    const res: QueryResult = await this.poolClient.query(
      `update ${table} set ${updated} where id = ${id} returning ${returning};`,
      values
    );
    return res.rowCount ? res.rows[0] : null;
  }

  public async insertValue(
    table: string,
    data: any,
    returning: string[] = ['*']
  ): Promise<any> {
    const [ keys, values, valuesTemplate ]: 
      [string[], dataElement[], string[]] = this.formatData(data);
    const res: QueryResult = await this.poolClient.query(
      `insert into ${table} (${keys}) values (${valuesTemplate}) returning ${returning};`,
      values
    );
    return res.rows[0];
  }

  public async removeValue(
    table: string,
    searchParams: unknown,
  ): Promise<void> {
    const [ keys, values, valuesTemplate ]: 
      [string[], dataElement[], string[]] = this.formatData(searchParams);
    const params: string[] = [];
    for (let i = 0; i < keys.length; i++)
      params.push(keys[i] + ' = ' + valuesTemplate[i]);
    await this.poolClient.query(
      `delete from ${table} where ${params.join(' and ')};`,
      values
    );
  }
}
