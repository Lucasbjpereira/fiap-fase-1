import { Elysia, t } from 'elysia';
import { useCases } from '../../composition';
import { idParams } from '../request-schemas';
import { workshopView } from '../presenters';

export const workshopRoutes = new Elysia()
  .post('/workshops', async ({ body, set }) => { set.status = 201; return workshopView(await useCases.workshops.create.execute(body)); }, {
    body: t.Object({ name: t.String({ minLength: 2, maxLength: 180 }), document: t.String({ maxLength: 14 }), address: t.String({ minLength: 3 }), phone: t.Optional(t.String({ maxLength: 30 })) })
  })
  .get('/workshops/:id', async ({ params }) => workshopView(await useCases.workshops.get.execute(params.id)), {
    params: idParams
  });
