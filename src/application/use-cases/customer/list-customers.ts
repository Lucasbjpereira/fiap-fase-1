import type { CustomerRepository } from '../../../domain/customer/customer-repository';
export class ListCustomers {
  constructor(private readonly repository: CustomerRepository) {}
  execute(limit?: string, offset?: string) { return this.repository.findAll(Math.min(100, Math.max(1, Number(limit) || 50)), Math.max(0, Number(offset) || 0)); }
}
