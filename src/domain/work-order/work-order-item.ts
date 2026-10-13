import { DomainError } from '../shared/domain-error';
import { Money, Quantity } from '../shared/value-objects';

export type ItemKind = 'SERVICE' | 'PART';
export class WorkOrderItem {
  constructor(readonly id: number | undefined, readonly kind: ItemKind, readonly catalogId: number,
    readonly description: string, readonly quantity: Quantity, readonly unitPrice: Money,
    readonly consumed: boolean = false) {
    if (kind !== 'SERVICE' && kind !== 'PART') throw new DomainError('Tipo de item inválido');
    if (!Number.isSafeInteger(catalogId) || catalogId <= 0 || !description.trim()) throw new DomainError('Item da OS inválido');
    if (consumed && kind !== 'PART') throw new DomainError('Somente peças podem ser consumidas');
    Object.freeze(this);
  }
  get total(): Money { return this.unitPrice.multiply(this.quantity.value); }
  markConsumed(): WorkOrderItem {
    if (this.kind !== 'PART' || this.consumed) throw new DomainError('Item não pode ser consumido novamente', 'conflict');
    return new WorkOrderItem(this.id, this.kind, this.catalogId, this.description, this.quantity, this.unitPrice, true);
  }
}
