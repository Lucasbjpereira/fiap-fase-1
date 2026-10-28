import { DomainError } from '../shared/domain-error';

export class QuoteVersion {
  constructor(readonly value: number) {
    if (!Number.isSafeInteger(value) || value < 1) throw new DomainError('Versão do orçamento inválida');
    Object.freeze(this);
  }
  next(): QuoteVersion { return new QuoteVersion(this.value + 1); }
  equals(other: QuoteVersion): boolean { return this.value === other.value; }
}
