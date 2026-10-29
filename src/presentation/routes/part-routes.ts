import { Elysia, t } from 'elysia';
import type { UseCases } from '../../composition';
import { idParams, nonNegativeInteger, priceCents } from '../request-schemas';
import { movementView, partView } from '../presenters';

export const createPartRoutes = (useCases: UseCases) => new Elysia()
  .get('/parts', async () => (await useCases.parts.list.execute()).map(partView))
  .get('/parts/:id', async ({ params }) => partView(await useCases.parts.get.execute(params.id)), {
    params: idParams
  })
  .post('/parts', async ({ body, set }) => { set.status = 201; return partView(await useCases.parts.create.execute(body)); }, {
    body: t.Object({ sku: t.String({ maxLength: 80 }), name: t.String({ maxLength: 160 }), description: t.Optional(t.String()), priceCents, stockQuantity: t.Optional(nonNegativeInteger), minimumStock: t.Optional(nonNegativeInteger) })
  })
  .patch('/parts/:id', async ({ params, body }) => partView(await useCases.parts.update.execute(params.id, body)), {
    params: idParams,
    body: t.Object({ name: t.Optional(t.String({ maxLength: 160 })), description: t.Optional(t.String()), priceCents: t.Optional(priceCents), minimumStock: t.Optional(nonNegativeInteger), active: t.Optional(t.Boolean()) })
  })
  .delete('/parts/:id', ({ params }) => useCases.parts.deactivate.execute(params.id), {
    params: idParams,
    detail: { summary: 'Desativa peça, preservando saldo, movimentos e itens das OS existentes' }
  })
  .post('/parts/:id/movements', async ({ params, body }) => partView(await useCases.parts.adjustStock.execute(params.id, body.quantityDelta, body.reason)), {
    params: idParams,
    body: t.Object({ quantityDelta: t.Integer({ minimum: -1000000, maximum: 1000000 }), reason: t.String({ minLength: 3, maxLength: 120 }) })
  })
  .get('/parts/:id/movements', async ({ params }) => (await useCases.parts.movements.execute(params.id)).map(movementView), {
    params: idParams
  });
