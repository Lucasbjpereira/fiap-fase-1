import { Money } from '../shared/value-objects';
import { QuoteVersion } from './quote-version';
import type { WorkOrderItem } from './work-order-item';

/** Objeto de valor: orçamento identificado por conteúdo/versão, pertencente à OS. */
export class Quote {
  constructor(readonly total: Money, readonly version: QuoteVersion) { Object.freeze(this); }
  static calculate(items: readonly WorkOrderItem[], version: QuoteVersion): Quote {
    return new Quote(items.reduce((sum, item) => sum.add(item.total), new Money(0)), version);
  }
  equals(other: Quote): boolean { return this.total.equals(other.total) && this.version.equals(other.version); }
}

export function quoteTotalCents(items: Array<{ quantity: number; unitPriceCents: number }>): number {
  return items.reduce((sum, item) => sum.add(new Money(item.unitPriceCents).multiply(item.quantity)), new Money(0)).cents;
}
