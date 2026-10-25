import { describe, expect, it } from 'bun:test';
import { publicWorkOrderRoutes } from './routes/work-order-routes';

describe('decisão pública de orçamento', () => {
  it('exige a versão do orçamento antes de aceitar uma decisão', async () => {
    for (const approved of [true, false]) {
      const response = await publicWorkOrderRoutes.handle(new Request('http://localhost/public/work-orders/codigo/decision', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ approved })
      }));

      expect(response.status).toBe(422);
    }
  });
});
