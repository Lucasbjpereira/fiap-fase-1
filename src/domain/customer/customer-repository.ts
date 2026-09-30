import type { Customer } from './customer';
export interface CustomerRepository {
  findById(id: number): Promise<Customer | undefined>;
  findByDocument(document: string): Promise<Customer | undefined>;
  findAll(limit: number, offset: number): Promise<Customer[]>;
  save(customer: Customer): Promise<Customer>;
  delete(id: number): Promise<boolean>;
}
