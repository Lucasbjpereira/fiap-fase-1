import { DomainError } from '../shared/domain-error';
import { TaxDocument } from '../shared/value-objects';

export class Customer {
  constructor(
    readonly id: number | undefined,
    readonly name: string,
    readonly document: TaxDocument,
    readonly email?: string,
    readonly phone?: string
  ) {
    if (name.trim().length < 2) throw new DomainError('Nome do cliente inválido');
    Object.freeze(this);
  }
  static create(input: { name: string; document: string; email?: string; phone?: string }): Customer {
    return new Customer(undefined, input.name.trim(), new TaxDocument(input.document), input.email, input.phone);
  }
  rename(name: string): Customer {
    return new Customer(this.id, name.trim(), this.document, this.email, this.phone);
  }
  changeEmail(email: string): Customer {
    return new Customer(this.id, this.name, this.document, email, this.phone);
  }
  changePhone(phone: string): Customer {
    return new Customer(this.id, this.name, this.document, this.email, phone);
  }
}
