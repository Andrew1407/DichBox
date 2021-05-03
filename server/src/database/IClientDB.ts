export default interface IClientDB {
  openPool(): Promise<void>;
  closePool(): void;

  rawQuery(query: string, args?: any[]): Promise<any>;

  getUserId(name: string|null): Promise<number>;

  selectValues(
    table: string,
    input: any,
    output?: string[]
  ): Promise<any[]|null>;

  selectJoinedValues(
    tables: string[],
    joinColumns: string[],
    input: any,
    output?: string[],
    extraCondition?: string
  ): Promise<any[]>;

  selectDoubleJoinedValues(
    tables: string[],
    joinConditions: string[],
    input: any,
    output?: string[],
    extraCondition?: string
  ): Promise<any[]>;

  updateValueById(
    table: string,
    id: number,
    data: any,
    returning?: string[]
  ): Promise<any>;

  insertValue(
    table: string,
    data: any,
    returning?: string[]
  ): Promise<any>;

  removeValue(
    table: string,
    searchParams: unknown,
  ): Promise<void>;
}
