import type { CustomerRepository } from '../../../domain/customer/customer-repository';
import { requireFound } from '../../require-found';
export class UpdateCustomer {
  constructor(private readonly repository: CustomerRepository) {}
  async execute(id: number, input: { name?: string; email?: string; phone?: string }) {
    const current = requireFound(await this.repository.findById(id), 'Cliente');
    let updated = current;
    if (input.name !== undefined) updated = updated.rename(input.name);
    if (input.email !== undefined) updated = updated.changeEmail(input.email);
    if (input.phone !== undefined) updated = updated.changePhone(input.phone);
    return this.repository.save(updated);
  }
}
