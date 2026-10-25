import { describe, expect, it } from 'bun:test';
import type { SqlConnection } from '../database/postgres-dao';
import { PgWorkOrderQueries } from './work-order-queries';

describe('consultas públicas da OS', () => {
  it('lê orçamento e itens na mesma consulta', async () => {
    const item = { kind: 'SERVICE', description: 'Revisão', quantity: 1, unit_price_cents: 2500 };
    const statements: string[] = [];
    const sql = {
      unsafe: async (statement: string) => {
        statements.push(statement);
        return [{
          id: 7,
          tracking_code: 'codigo',
          status: 'AWAITING_APPROVAL',
          complaint: 'Revisão preventiva',
          quote_total_cents: 2500,
          quote_version: 1,
          opened_at: new Date('2026-01-01T00:00:00.000Z'),
          updated_at: new Date('2026-01-01T00:00:00.000Z'),
          brand: 'Ford',
          model: 'Ka',
          plate: 'ABC1D23',
          items: [item]
        }];
      }
    } as unknown as SqlConnection;

    const view = await new PgWorkOrderQueries(sql).publicView('codigo');

    expect(statements).toHaveLength(1);
    expect(statements[0]).toContain('json_agg');
    expect(view?.quoteVersion).toBe(1);
    expect(view?.items).toEqual([item]);
  });
});
