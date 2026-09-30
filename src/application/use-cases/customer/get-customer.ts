import type { CustomerRepository } from '../../../domain/customer/customer-repository';
import { requireFound } from '../../require-found';
export class GetCustomer {
  constructor(private readonly repository: CustomerRepository) {}
  async execute(id: number) { return requireFound(await this.repository.findById(id), 'Cliente'); }
}
