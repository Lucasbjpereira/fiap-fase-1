import { DomainError } from '../shared/domain-error';
export class InventoryMovement {
  constructor(readonly id: number | undefined, readonly partId: number, readonly quantityDelta: number,
    readonly reason: string, readonly workOrderId?: number, readonly createdAt: Date = new Date()) {
    if (!Number.isSafeInteger(partId) || partId <= 0 || (workOrderId !== undefined && (!Number.isSafeInteger(workOrderId) || workOrderId <= 0))) throw new DomainError('Referência de movimentação inválida');
    if (!Number.isSafeInteger(quantityDelta) || quantityDelta === 0 || reason.trim().length < 3) throw new DomainError('Movimentação inválida');
    Object.freeze(this);
  }
}
