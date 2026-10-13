import { Elysia } from 'elysia';

const directory = new URL('../../../docs/ddd/event-storming/', import.meta.url);

/** Artefato de documentação local, sem dependência de scripts ou fontes externos. */
export const eventStormingRoutes = new Elysia()
  .get('/event-storming', () => Bun.file(new URL('index.html', directory)), { detail: { hide: true } })
  .get('/event-storming/:file', async ({ params, set }) => {
    if (!/^(?:\d{2}(?:-[a-z-]+)?\.(?:svg|mmd)|catalogo\.json)$/.test(params.file)) {
      set.status = 404;
      return { error: 'Artefato não encontrado' };
    }
    const file = Bun.file(new URL(params.file, directory));
    if (!(await file.exists())) { set.status = 404; return { error: 'Artefato não encontrado' }; }
    return file;
  }, { detail: { hide: true } });
