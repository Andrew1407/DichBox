import { Pool, PoolClient, QueryResult } from 'pg';
import {
  userData,
  boxData,
  dataElement,
  subscribersData 
} from '../datatypes';

export default class ClientDichBoxDB {
  private pool: Pool;
  protected poolClient!: PoolClient;
  
  constructor() {
    this.pool = new Pool({
      host: 'localhost',
      user: 'andrew1407',
      password: 'sasik',
      database: 'dich_box'
    });
  }

  public async clientConnection(): Promise<void> {
    this.poolClient = await this.pool.connect();
  }

  private formatData(data: userData|boxData|subscribersData): 
    [string[], dataElement[], string[]] {
      const keys: string[] = Object.keys(data);
      const values: any[] = Object.values(data);
      const valuesTemplate: string[] = [];
      for (let i = 1; i <= values.length; i++)
        valuesTemplate.push(`$${i}`);
      return [ keys, values, valuesTemplate ];
  }

  protected async selectValues(
    table: string,
    input: boxData|userData|subscribersData,
    output: string[] = ['*']
  ): Promise<any[]> {
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

  protected async updateValueById(
    table: string,
    id: number,
    data: boxData|userData,
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

  protected async insertValue(
    table: string,
    data: boxData|userData|subscribersData,
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

  protected async removeValue(
    table: string,
    searchParams: any
  ): Promise<void> {
    const [ keys, values, valuesTemplate ]: 
      [string[], dataElement[], string[]] = this.formatData(searchParams);
    const params: string[] = [];
    for (let i = 0; i < keys.length; i++)
      params.push(keys[i] + ' = ' + valuesTemplate[i]);
    await this.poolClient.query(
      `delete from ${table} where ${params};`,
      values
    );
  }
}
