import { DomainError } from '../shared/domain-error';
import { TaxDocument } from '../shared/value-objects';

export class Workshop {
  constructor(readonly id: number | undefined, readonly name: string, readonly document: TaxDocument,
    readonly address: string, readonly phone?: string) {
    if (name.trim().length < 2 || address.trim().length < 3) throw new DomainError('Dados da oficina inválidos');
  }
  static create(input: { name: string; document: string; address: string; phone?: string }): Workshop {
    return new Workshop(undefined, input.name.trim(), new TaxDocument(input.document), input.address.trim(), input.phone);
  }
}
