import { Pool, PoolClient, QueryResult } from 'pg';
import {
  userInput,
  boxInput,
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

  private formatData(data: userInput|boxInput|subscribersData): 
    [string[], dataElement[], string[]] {
      const keys: string[] = Object.keys(data);
      const values: any[] = Object.values(data);
      const valuesTemplate: string[] = [];
      for (let i = 1; i <= values.length; i++)
        valuesTemplate.push(`$${i}`);
      return [ keys, values, valuesTemplate ];
  }

  protected async findValueByColumns(
    table: string,
    data: boxInput|userInput
  ): Promise<any> {
    const [ keys, values, valuesTemplate ]: 
      [string[], dataElement[], string[]] = this.formatData(data);
    const selectSearch: string[] = [];
    for (let i = 0; i < keys.length; i++)
      selectSearch.push(keys[i] + ' = ' + valuesTemplate[i]);
      const res: QueryResult = await this.poolClient.query(
        `select * from ${table} where ${selectSearch.join(' and ')};`,
        values
      );
    return res.rowCount ? res.rows[0] : null;
  }

  protected async findValueById(
    table: string,
    id: number
  ): Promise<any> {
    const res: QueryResult = await this.poolClient.query(
      `select * from ${table} where id = $1;`, [id]
    );
    return res.rowCount ? res.rows[0] : null;
  }

  protected async updateValueById(
    table: string,
    id: number,
    data: boxInput|userInput
  ): Promise<any> {
    const [ keys, values, valuesTemplate ]: 
      [string[], dataElement[], string[]] = this.formatData(data);
    const updated: string[] = [];
    for (let i = 0; i < keys.length; i++)
      updated.push(keys[i] + ' = ' + valuesTemplate[i]);
    const res: QueryResult = await this.poolClient.query(
      `update ${table} set ${updated} where id = ${id} returning *;`,
      values
    );
    return res.rowCount ? res.rows[0] : null;
  }

  protected async insertValue(
    table: string,
    data: boxInput|userInput|subscribersData
  ): Promise<any> {
    const [ keys, values, valuesTemplate ]: 
      [string[], dataElement[], string[]] = this.formatData(data);
    const res: QueryResult = await this.poolClient.query(
      `insert into ${table} (${keys}) values (${valuesTemplate}) returning *;`,
      values
    );
    return res.rows[0];
  }
}
