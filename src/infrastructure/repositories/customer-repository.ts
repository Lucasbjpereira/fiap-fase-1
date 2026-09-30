import { Customer } from '../../domain/customer/customer';
import type { CustomerRepository } from '../../domain/customer/customer-repository';
import { TaxDocument } from '../../domain/shared/value-objects';
import { PostgresDao } from '../database/postgres-dao';

type Row = { id: number; name: string; document: string; email: string | null; phone: string | null };
const map = (row: Row) => new Customer(row.id, row.name, new TaxDocument(row.document), row.email ?? undefined, row.phone ?? undefined);

export class PgCustomerRepository extends PostgresDao implements CustomerRepository {
  async findById(id: number) { const row = await this.first<Row>('SELECT * FROM customers WHERE id = $1', [id]); return row && map(row); }
  async findByDocument(document: string) { const row = await this.first<Row>('SELECT * FROM customers WHERE document = $1', [document]); return row && map(row); }
  async findAll(limit: number, offset: number) { return (await this.rows<Row>('SELECT * FROM customers ORDER BY id LIMIT $1 OFFSET $2', [limit, offset])).map(map); }
  async save(customer: Customer) {
    const row = customer.id === undefined
      ? await this.first<Row>('INSERT INTO customers (name, document, email, phone) VALUES ($1, $2, $3, $4) RETURNING *', [customer.name, customer.document.value, customer.email ?? null, customer.phone ?? null])
      : await this.first<Row>('UPDATE customers SET name = $2, email = $3, phone = $4, updated_at = now() WHERE id = $1 RETURNING *', [customer.id, customer.name, customer.email ?? null, customer.phone ?? null]);
    return map(row!);
  }
  async delete(id: number) { return (await this.rows('DELETE FROM customers WHERE id = $1 RETURNING id', [id])).length > 0; }
}
