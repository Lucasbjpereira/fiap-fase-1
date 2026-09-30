import { Customer } from '../../../domain/customer/customer';
import type { CustomerRepository } from '../../../domain/customer/customer-repository';
export class CreateCustomer {
  constructor(private readonly repository: CustomerRepository) {}
  execute(input: Parameters<typeof Customer.create>[0]) { return this.repository.save(Customer.create(input)); }
}
