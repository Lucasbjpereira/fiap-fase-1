import type { CustomerRepository } from '../../../domain/customer/customer-repository';
export class ListCustomers {
  constructor(private readonly repository: CustomerRepository) {}
  execute(limit?: number, offset?: number) { return this.repository.findAll(Math.min(100, Math.max(1, limit ?? 50)), Math.max(0, offset ?? 0)); }
}
