import { describe, expect, it } from 'bun:test';
import type { UseCases } from '../composition';
import { createCustomerRoutes } from './routes/customer-routes';
import { createPartRoutes } from './routes/part-routes';
import { createServiceRoutes } from './routes/service-routes';
import { createPublicWorkOrderRoutes, createWorkOrderRoutes } from './routes/work-order-routes';

const invalidUseCases = {} as UseCases;
const customerRoutes = createCustomerRoutes(invalidUseCases);
const partRoutes = createPartRoutes(invalidUseCases);
const serviceRoutes = createServiceRoutes(invalidUseCases);
const workOrderRoutes = createWorkOrderRoutes(invalidUseCases);
const publicWorkOrderRoutes = createPublicWorkOrderRoutes(invalidUseCases);

describe('validação de entradas HTTP', () => {
  it('recusa IDs que não são inteiros positivos dentro do limite do banco', async () => {
    for (const id of ['abc', '1.5', '2147483648']) {
      const response = await customerRoutes.handle(new Request(`http://localhost/customers/${id}`));
      expect(response.status).toBe(422);
    }
  });

  it('recusa paginação fracionária e fora dos limites', async () => {
    for (const query of ['limit=abc', 'limit=1.5', 'limit=101', 'offset=-1', 'offset=2147483648', 'offset=Infinity']) {
      const response = await customerRoutes.handle(new Request(`http://localhost/customers?${query}`));
      expect(response.status).toBe(422);
    }

    const workOrdersResponse = await workOrderRoutes.handle(new Request('http://localhost/work-orders?limit=1.5'));
    expect(workOrdersResponse.status).toBe(422);
  });

  it('recusa versão de orçamento acima do inteiro suportado pelo banco', async () => {
    const response = await publicWorkOrderRoutes.handle(new Request('http://localhost/public/work-orders/codigo/decision', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ approved: true, quoteVersion: 2147483648 })
    }));

    expect(response.status).toBe(422);
  });

  it('recusa valores monetários acima do inteiro suportado pelo PostgreSQL', async () => {
    const serviceResponse = await serviceRoutes.handle(new Request('http://localhost/services', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ name: 'Serviço', priceCents: 2147483648, estimatedMinutes: 30 })
    }));
    const partResponse = await partRoutes.handle(new Request('http://localhost/parts', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ sku: 'FILTRO-1', name: 'Filtro', priceCents: 2147483648 })
    }));

    expect(serviceResponse.status).toBe(422);
    expect(partResponse.status).toBe(422);
  });

  it('recusa campos de cliente maiores que as colunas persistidas', async () => {
    for (const customer of [
      { name: 'N'.repeat(181), document: '52998224725' },
      { name: 'Cliente', document: '52998224725', email: 'e'.repeat(256) },
      { name: 'Cliente', document: '52998224725', phone: '1'.repeat(31) }
    ]) {
      const response = await customerRoutes.handle(new Request('http://localhost/customers', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(customer)
      }));

      expect(response.status).toBe(422);
    }
  });
});
