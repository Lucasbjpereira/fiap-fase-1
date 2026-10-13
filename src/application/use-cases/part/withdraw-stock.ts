import type { UnitOfWork } from '../../unit-of-work';
import { Quantity } from '../../../domain/shared/value-objects';
import { requireFound } from '../../require-found';

export interface WithdrawStockCommand { readonly partId: number; readonly quantity: number; readonly reason: string }

export class WithdrawStock {
  constructor(private readonly unitOfWork: UnitOfWork) {}
  execute(command: WithdrawStockCommand) {
    return this.unitOfWork.run(async ({ parts, events }) => {
      const current = requireFound(await parts.findById(command.partId, true), 'Peça');
      const change = current.recordWithdrawal(new Quantity(command.quantity), command.reason);
      const updated = await parts.save(change.part);
      await parts.recordMovement(change.movement);
      await events.append(change.events);
      return updated;
    });
  }
}
