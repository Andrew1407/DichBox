import { QueryResult } from 'pg';
import ClientDichBoxDB from './ClientDichBoxDB';
import {
  userInput,
  userData,
  subscribersData 
} from '../datatypes';

export default class UserClientDichBoxDB extends ClientDichBoxDB {
  public async insertUser(userData: userInput): Promise<userData> {
    return await this.insertValue('users', userData);
  }

  public async updateUser(
    id: number,
    userData: userInput
  ): Promise<userData|null> {
    return await this.updateValueById('users', id, userData);
  }

  public async findUserByColumns(
    values: userInput
  ): Promise<userData|null> {
    return await this.findValueByColumns('users', values);
  }

  public async findUserById(
    id: number
  ): Promise<userData|null> {
    return await this.findValueById('users', id);
  }

  public async removeUser(id: number): Promise<void> {
    const queries: string[] = [
      'delete from users where id = $1;',
      `update users set subscriptions = array_remove(subscriptions, $1) where \'{${id}}\' <@ subscriptions;`,
      // 'update users set followers = (followers - 1) where \'{$1}\' <@ distributors_arr;',
    ];
    queries.forEach(async query =>
      await this.poolClient.query(query, [id])
    );
  }

  // subscribers

  public async getUserSubsciptions(userId: string): Promise<number[]> {
    const res: QueryResult = await this.poolClient.query(
      'select subscription from subscribers where person_id = $1;',
      [userId]
    );
    const subscriptions: number[] = res.rows
      .map(x => x.subscription);
    return subscriptions;
  }

  public async addSubsciber(
    userId: number,
    subscriptionId: number
  ): Promise<void> {
    const insertData: subscribersData = {
      person_id: userId,
      subscription: subscriptionId
    }
    await this.insertValue('subscribers', insertData);
  }

  public async removeSubscriber(
    userId: number,
    subscriptionId: number
  ): Promise<void> {
    await this.poolClient.query(
      'delete from subscribers where person_id = $1 and subscription = $2;',
      [ userId, subscriptionId ]
    );
  }

  public async checkSubscription(
    userId: number,
    subscriptionId: number
  ): Promise<boolean> {
    const res: QueryResult = await this.poolClient.query(
      'select subscription from subscribers where person_id = $1 and subscription = $2;',
      [ userId, subscriptionId ]
    );
    return res.rowCount ? true : false;
  }
}
