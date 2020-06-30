import { Pool, PoolClient, QueryResult } from 'pg';

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

  public async clientConnection(): Promise<void> {
    this.poolClient = await this.pool.connect();
  }

  public async createUser(userData: {
    name: string,
    email: string,
    passwd: string,
    description?: string
  }): Promise<number> {      
    const res: QueryResult = await this.poolClient.query(
      `insert into users (${Object.keys(userData)}) values (${Object.values(userData)}) returning id;`
    );
    const id: number = res.rows[0].id;
    return id;
  }

  public async setDescription(database: string, data: string): 
    Promise<void> {
      await this.poolClient.query(
        `update ${database} set description = $1;`, [data]
      );
  }

  public async insertSubscriber(userId: string): 
    Promise<void> {}

}
