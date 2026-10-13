import postgres from 'postgres';

export type SqlConnection = postgres.Sql | postgres.TransactionSql;
type Parameter = string | number | boolean | null | Date;

// Acesso SQL parametrizado compartilhado pelos adaptadores de persistência.
export abstract class PostgresDao {
  constructor(protected readonly sql: SqlConnection) {}

  protected async rows<T>(statement: string, parameters: Parameter[] = []): Promise<T[]> {
    return await this.sql.unsafe(statement, parameters.map(parameter => parameter instanceof Date ? parameter.toISOString() : parameter)) as unknown as T[];
  }

  protected async first<T>(statement: string, parameters: Parameter[] = []): Promise<T | undefined> {
    return (await this.rows<T>(statement, parameters))[0];
  }
}
