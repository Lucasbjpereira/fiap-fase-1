import type { UnitOfWork } from '../../unit-of-work';
import { InventoryMovement } from '../../../domain/part/inventory-movement';
import { ApplicationError } from '../../errors';
import { requireFound } from '../../require-found';

export class AdjustStock {
  constructor(private readonly unitOfWork: UnitOfWork) {}
  execute(id: number, delta: number, reason: string) {
    return this.unitOfWork.run(async ({ parts }) => {
      const current = requireFound(await parts.findById(id), 'Peça');
      if (delta > 0) current.receiveStock(delta);
      else current.withdrawStock(-delta);
      const updated = await parts.adjustStock(id, delta);
      if (!updated) throw new ApplicationError('conflict', 'Estoque não pode ficar negativo');
      await parts.recordMovement(new InventoryMovement(undefined, id, delta, reason));
      return updated;
    });
  }
}
