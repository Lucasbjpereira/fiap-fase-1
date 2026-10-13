import type { UnitOfWork } from '../../unit-of-work';
import { requireFound } from '../../require-found';

export interface FinishRepairCommand { readonly workOrderId: number; readonly note?: string }

export class FinishRepair {
  constructor(private readonly unitOfWork: UnitOfWork) {}
  execute(command: FinishRepairCommand) {
    return this.unitOfWork.run(async ({ workOrders, events }) => {
      const order = requireFound(await workOrders.findById(command.workOrderId, true), 'OS');
      const changed = order.finishRepair(command.note);
      await workOrders.save(changed);
      await events.append(changed.pendingEvents);
      return { ok: true, status: changed.status };
    });
  }
}
