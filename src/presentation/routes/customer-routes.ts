import { Elysia, t } from 'elysia';
import { useCases } from '../../composition';
import { idParams, paginationQuery } from '../request-schemas';
import { customerView } from '../presenters';

export const customerRoutes = new Elysia()
  .get('/customers', async ({ query }) => (await useCases.customers.list.execute(query.limit, query.offset)).map(customerView), {
    query: paginationQuery
  })
  .post('/customers', async ({ body, set }) => { set.status = 201; return customerView(await useCases.customers.create.execute(body)); }, {
    body: t.Object({ name: t.String({ minLength: 2, maxLength: 180 }), document: t.String({ maxLength: 14 }), email: t.Optional(t.String({ maxLength: 255 })), phone: t.Optional(t.String({ maxLength: 30 })) })
  })
  .get('/customers/:id', async ({ params }) => customerView(await useCases.customers.get.execute(params.id)), {
    params: idParams
  })
  .patch('/customers/:id', async ({ params, body }) => customerView(await useCases.customers.update.execute(params.id, body)), {
    params: idParams,
    body: t.Object({ name: t.Optional(t.String({ minLength: 2, maxLength: 180 })), email: t.Optional(t.String({ maxLength: 255 })), phone: t.Optional(t.String({ maxLength: 30 })) })
  })
  .delete('/customers/:id', ({ params }) => useCases.customers.delete.execute(params.id), {
    params: idParams
  });
