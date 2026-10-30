import { Elysia, t } from 'elysia';
import type { UseCases } from '../../composition';
import { idParams, positiveInteger } from '../request-schemas';
import { vehicleView } from '../presenters';

export const createVehicleRoutes = (useCases: UseCases) => new Elysia()
  .get('/vehicles', async () => (await useCases.vehicles.list.execute()).map(vehicleView))
  .get('/vehicles/:id', async ({ params }) => vehicleView(await useCases.vehicles.get.execute(params.id)), {
    params: idParams
  })
  .post('/vehicles', async ({ body, set }) => { set.status = 201; return vehicleView(await useCases.vehicles.create.execute(body)); }, {
    body: t.Object({ customerId: positiveInteger, plate: t.String({ maxLength: 7 }), brand: t.String({ maxLength: 80 }), model: t.String({ maxLength: 100 }), year: t.Integer({ minimum: 1950, maximum: 2100 }) })
  })
  .patch('/vehicles/:id', async ({ params, body }) => vehicleView(await useCases.vehicles.update.execute(params.id, body)), {
    params: idParams,
    body: t.Object({ brand: t.Optional(t.String({ maxLength: 80 })), model: t.Optional(t.String({ maxLength: 100 })), year: t.Optional(t.Integer({ minimum: 1950, maximum: 2100 })) })
  })
  .delete('/vehicles/:id', ({ params }) => useCases.vehicles.delete.execute(params.id), {
    params: idParams,
    detail: { summary: 'Exclui veículo e suas OS em cascata', description: 'Remove também itens, decisões e histórico das OS. Preserva cliente, catálogo, saldo, movimentos de estoque (sem vínculo à OS removida) e eventos de auditoria.' }
  });
