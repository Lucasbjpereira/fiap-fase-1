import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import * as schema from './schema';

export const client = postgres(process.env.DATABASE_URL ?? 'postgres://oficina:oficina_local@localhost:5432/oficina', { max: 10 });
export const db = drizzle(client, { schema });
