import { UserData, BoxData, SubscribersData, NotificationsData } from '../datatypes';

export default interface IClientDB {
  clientConnect(): Promise<void>;
  clientClose(): void;

  rawQuery(query: string, args?: any[]): Promise<any>;

  getUserId(name: string): Promise<number|null>;

  selectValues(
    table: string,
    input: BoxData|UserData|SubscribersData|NotificationsData,
    output?: string[]
  ): Promise<any[]|null>;

  selectJoinedValues(
    tables: string[],
    joinColumns: string[],
    input: BoxData|UserData|SubscribersData|NotificationsData,
    output?: string[],
    extraCondition?: string
  ): Promise<any[]>;

  selectDoubleJoinedValues(
    tables: string[],
    joinConditions: string[],
    input: BoxData|UserData|SubscribersData,
    output?: string[],
    extraCondition?: string
  ): Promise<any[]>;

  updateValueById(
    table: string,
    id: number,
    data: BoxData|UserData,
    returning?: string[]
  ): Promise<any>;

  insertValue(
    table: string,
    data: BoxData|UserData|SubscribersData,
    returning?: string[]
  ): Promise<any>;

  removeValue(
    table: string,
    searchParams: unknown,
  ): Promise<void>;
}
