import { Elysia, t } from 'elysia';
import { useCases } from '../../composition';
import { idParams, positiveInteger, priceCents } from '../request-schemas';
import { serviceView } from '../presenters';

export const serviceRoutes = new Elysia()
  .get('/services', async () => (await useCases.services.list.execute()).map(serviceView))
  .get('/services/:id', async ({ params }) => serviceView(await useCases.services.get.execute(params.id)), {
    params: idParams
  })
  .post('/services', async ({ body, set }) => { set.status = 201; return serviceView(await useCases.services.create.execute(body)); }, {
    body: t.Object({ name: t.String({ maxLength: 160 }), description: t.Optional(t.String()), priceCents, estimatedMinutes: positiveInteger })
  })
  .patch('/services/:id', async ({ params, body }) => serviceView(await useCases.services.update.execute(params.id, body)), {
    params: idParams,
    body: t.Object({ name: t.Optional(t.String({ maxLength: 160 })), description: t.Optional(t.String()), priceCents: t.Optional(priceCents), estimatedMinutes: t.Optional(positiveInteger), active: t.Optional(t.Boolean()) })
  })
  .delete('/services/:id', ({ params }) => useCases.services.deactivate.execute(params.id), {
    params: idParams
  });
