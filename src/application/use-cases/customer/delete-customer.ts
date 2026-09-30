import type { CustomerRepository } from '../../../domain/customer/customer-repository';
import { ApplicationError } from '../../errors';
export class DeleteCustomer {
  constructor(private readonly repository: CustomerRepository) {}
  async execute(id: number) {
    if (!(await this.repository.delete(id))) throw new ApplicationError('not_found', 'Cliente não encontrado');
    return { deleted: true };
  }
}
