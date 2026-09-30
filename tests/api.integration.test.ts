import { afterAll, beforeAll, describe, expect, it } from 'bun:test';
import { app } from '../src/presentation/app';

const enabled = process.env.RUN_INTEGRATION === 'true';
describe.skipIf(!enabled)('fluxo integrado da API (requer PostgreSQL migrado e seed)', () => {
  let server: ReturnType<typeof app.listen>;
  let baseUrl = '';
  let token = '';
  beforeAll(async () => {
    server = app.listen(0);
    baseUrl = `http://localhost:${server.server?.port}`;
    const login = await fetch(`${baseUrl}/api/v1/auth/login`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ email: process.env.ADMIN_EMAIL ?? 'admin@oficina.local', password: process.env.ADMIN_PASSWORD ?? 'TroqueEstaSenha123!' }) });
    expect(login.status).toBe(200);
    token = (await login.json() as { token: string }).token;
  });
  afterAll(() => server?.stop());
  it('cria OS, consulta orçamento, aprova e acompanha mudanças', async () => {
    const headers = { authorization: `Bearer ${token}`, 'content-type': 'application/json' };
    const [customer] = await (await fetch(`${baseUrl}/api/v1/customers`, { headers })).json() as Array<{ id: number }>;
    const [vehicle] = await (await fetch(`${baseUrl}/api/v1/vehicles`, { headers })).json() as Array<{ id: number }>;
    const [service] = await (await fetch(`${baseUrl}/api/v1/services`, { headers })).json() as Array<{ id: number; priceCents: number }>;
    const partResponse = await fetch(`${baseUrl}/api/v1/parts`, {
      method: 'POST', headers,
      body: JSON.stringify({ sku: `OS-TEST-${crypto.randomUUID()}`, name: 'Peça da OS de integração', priceCents: 3500, stockQuantity: 10 })
    });
    expect(partResponse.status).toBe(201);
    const part = await partResponse.json() as { id: number; stockQuantity: number; priceCents: number };
    expect((await fetch(`${baseUrl}/api/v1/parts`, { headers })).status).toBe(200);
    expect(part.stockQuantity).toBeGreaterThan(0);
    const insufficient = await fetch(`${baseUrl}/api/v1/work-orders`, { method: 'POST', headers, body: JSON.stringify({ customerId: customer.id, vehicleId: vehicle.id, complaint: 'Teste de estoque insuficiente', items: [{ type: 'PART', id: part.id, quantity: part.stockQuantity + 1 }] }) });
    expect(insufficient.status).toBe(409);
    const created = await fetch(`${baseUrl}/api/v1/work-orders`, { method: 'POST', headers, body: JSON.stringify({ customerId: customer.id, vehicleId: vehicle.id, complaint: 'Teste integrado do fluxo completo', items: [{ type: 'SERVICE', id: service.id, quantity: 1 }, { type: 'PART', id: part.id, quantity: 1 }] }) });
    expect(created.status).toBe(201);
    const order = await created.json() as { id: number; trackingCode: string; quote_total_cents: number };
    expect(order.quote_total_cents).toBeGreaterThan(0);
    for (const status of ['DIAGNOSIS', 'AWAITING_APPROVAL']) {
      const response = await fetch(`${baseUrl}/api/v1/work-orders/${order.id}/status`, { method: 'POST', headers, body: JSON.stringify({ status }) });
      expect(response.status).toBe(200);
    }
    const tracking = await fetch(`${baseUrl}/api/v1/public/work-orders/${order.trackingCode}`);
    expect(tracking.status).toBe(200);
    const decision = await fetch(`${baseUrl}/api/v1/public/work-orders/${order.trackingCode}/decision`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ approved: true }) });
    expect(decision.status).toBe(200);
    expect((await decision.json() as { approved: boolean }).approved).toBe(true);
    const additional = await fetch(`${baseUrl}/api/v1/work-orders/${order.id}/items`, { method: 'POST', headers, body: JSON.stringify({ type: 'PART', id: part.id, quantity: 1 }) });
    expect(additional.status).toBe(200);
    expect((await additional.json() as { quoteTotalCents: number }).quoteTotalCents).toBe(order.quote_total_cents + part.priceCents);
    const secondApproval = await fetch(`${baseUrl}/api/v1/public/work-orders/${order.trackingCode}/decision`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ approved: true }) });
    expect(secondApproval.status).toBe(200);
    for (const status of ['FINISHED', 'DELIVERED']) {
      const response = await fetch(`${baseUrl}/api/v1/work-orders/${order.id}/status`, { method: 'POST', headers, body: JSON.stringify({ status }) });
      expect(response.status).toBe(200);
    }
    const finalOrder = await (await fetch(`${baseUrl}/api/v1/work-orders/${order.id}`, { headers })).json() as { status: string };
    expect(finalOrder.status).toBe('DELIVERED');
  });
  it('protege rotas administrativas e rejeita transição inválida', async () => {
    expect((await fetch(`${baseUrl}/api/v1/work-orders`)).status).toBe(401);
    const headers = { authorization: `Bearer ${token}`, 'content-type': 'application/json' };
    const [order] = await (await fetch(`${baseUrl}/api/v1/work-orders`, { headers })).json() as Array<{ id: number }>;
    const response = await fetch(`${baseUrl}/api/v1/work-orders/${order.id}/status`, { method: 'POST', headers, body: JSON.stringify({ status: 'RECEIVED' }) });
    expect(response.status).toBe(409);
  });
  it('gerencia cadastros e registra movimentações sem permitir estoque negativo', async () => {
    const headers = { authorization: `Bearer ${token}`, 'content-type': 'application/json' };
    const request = (path: string, method: string, body?: object) => fetch(`${baseUrl}/api/v1${path}`, { method, headers, body: body && JSON.stringify(body) });
    const base = String(Math.floor(100000000 + Math.random() * 900000000));
    const digit = (value: string) => { const sum = value.split('').reduce((n, char, i) => n + Number(char) * (value.length + 1 - i), 0); const rest = (sum * 10) % 11; return rest === 10 ? 0 : rest; };
    const document = base + digit(base) + digit(base + digit(base));
    const plate = 'TST' + Math.floor(1000 + Math.random() * 9000);
    const customerResponse = await request('/customers', 'POST', { name: 'Cliente de integração', document });
    expect(customerResponse.status).toBe(201);
    const customer = await customerResponse.json() as { id: number };
    expect((await request(`/customers/${customer.id}`, 'GET')).status).toBe(200);
    expect((await request(`/customers/${customer.id}`, 'PATCH', { phone: '+5511999990000' })).status).toBe(200);
    const invalidCustomer = await request('/customers', 'POST', { name: 'Inválido', document: '11111111111' });
    expect(invalidCustomer.status).toBe(422);

    const vehicleResponse = await request('/vehicles', 'POST', { customerId: customer.id, plate, brand: 'Ford', model: 'Ka', year: 2020 });
    expect(vehicleResponse.status).toBe(201);
    const vehicle = await vehicleResponse.json() as { id: number };
    expect((await request(`/vehicles/${vehicle.id}`, 'GET')).status).toBe(200);
    expect((await request(`/vehicles/${vehicle.id}`, 'PATCH', { year: 2021 })).status).toBe(200);
    expect((await request('/vehicles', 'POST', { customerId: customer.id, plate: 'INVALIDA', brand: 'Ford', model: 'Ka', year: 2020 })).status).toBe(422);

    const serviceResponse = await request('/services', 'POST', { name: 'Serviço de integração', priceCents: 1000, estimatedMinutes: 30 });
    expect(serviceResponse.status).toBe(201);
    const service = await serviceResponse.json() as { id: number };
    expect((await request(`/services/${service.id}`, 'GET')).status).toBe(200);
    expect((await request(`/services/${service.id}`, 'PATCH', { priceCents: 1200 })).status).toBe(200);
    expect((await request(`/services/${service.id}`, 'DELETE')).status).toBe(200);

    const partResponse = await request('/parts', 'POST', { sku: `TEST-${crypto.randomUUID()}`, name: 'Peça de integração', priceCents: 500, stockQuantity: 5 });
    expect(partResponse.status).toBe(201);
    const part = await partResponse.json() as { id: number };
    expect((await request(`/parts/${part.id}`, 'GET')).status).toBe(200);
    expect((await request(`/parts/${part.id}`, 'PATCH', { minimumStock: 2 })).status).toBe(200);
    expect((await request(`/parts/${part.id}/movements`, 'POST', { quantityDelta: 3, reason: 'Entrada de teste' })).status).toBe(200);
    expect((await request(`/parts/${part.id}/movements`, 'POST', { quantityDelta: -2, reason: 'Saída de teste' })).status).toBe(200);
    expect((await request(`/parts/${part.id}/movements`, 'POST', { quantityDelta: -100, reason: 'Saldo inválido' })).status).toBe(409);
    const movements = await (await request(`/parts/${part.id}/movements`, 'GET')).json() as unknown[];
    expect(movements.length).toBe(2);
    expect((await request(`/parts/${part.id}`, 'DELETE')).status).toBe(200);

    expect((await request(`/vehicles/${vehicle.id}`, 'DELETE')).status).toBe(200);
    expect((await request(`/customers/${customer.id}`, 'DELETE')).status).toBe(200);
  });
  it('cadastra oficina e consulta histórico e métrica', async () => {
    const headers = { authorization: `Bearer ${token}`, 'content-type': 'application/json' };
    const base = String(Math.floor(100000000000 + Math.random() * 900000000000));
    const checkDigit = (digits: string, weights: number[]) => {
      const remainder = digits.split('').reduce((sum, digit, index) => sum + Number(digit) * weights[index], 0) % 11;
      return remainder < 2 ? 0 : 11 - remainder;
    };
    const first = checkDigit(base, [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);
    const document = base + first + checkDigit(base + first, [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);
    const workshop = await fetch(`${baseUrl}/api/v1/workshops`, {
      method: 'POST', headers,
      body: JSON.stringify({ name: 'Oficina de integração', document, address: 'Rua das Oficinas, 10' })
    });
    expect(workshop.status).toBe(201);
    const created = await workshop.json() as { id: number };
    expect((await fetch(`${baseUrl}/api/v1/workshops/${created.id}`, { headers })).status).toBe(200);
    const [order] = await (await fetch(`${baseUrl}/api/v1/work-orders`, { headers })).json() as Array<{ id: number }>;
    expect((await fetch(`${baseUrl}/api/v1/work-orders/${order.id}/history`, { headers })).status).toBe(200);
    expect((await fetch(`${baseUrl}/api/v1/metrics/average-execution-time`, { headers })).status).toBe(200);
  });
});
