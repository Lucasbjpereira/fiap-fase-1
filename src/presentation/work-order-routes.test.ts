import { describe, expect, it } from 'bun:test';
import type { UseCases } from '../composition';
import { createPublicWorkOrderRoutes } from './routes/work-order-routes';

describe('decisão pública de orçamento', () => {
  it('exige a versão do orçamento antes de aceitar uma decisão', async () => {
    const routes = createPublicWorkOrderRoutes({} as UseCases);
    for (const approved of [true, false]) {
      const response = await routes.handle(new Request('http://localhost/public/work-orders/codigo/decision', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ approved })
      }));

      expect(response.status).toBe(422);
    }
  });
});
