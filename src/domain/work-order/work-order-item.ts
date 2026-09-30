import { DomainError } from '../shared/domain-error';
import { Money, Quantity } from '../shared/value-objects';

export type ItemKind = 'SERVICE' | 'PART';
export class WorkOrderItem {
  constructor(readonly id: number | undefined, readonly kind: ItemKind, readonly catalogId: number,
    readonly description: string, readonly quantity: Quantity, readonly unitPrice: Money,
    readonly consumed: boolean = false) {
    if (!Number.isSafeInteger(catalogId) || catalogId <= 0 || !description.trim()) throw new DomainError('Item da OS inválido');
  }
  get total(): Money { return this.unitPrice.multiply(this.quantity.value); }
}
