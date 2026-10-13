import type { UnitOfWork } from '../../unit-of-work';
import { requireFound } from '../../require-found';

export interface RecordDeliveryCommand { readonly workOrderId: number; readonly note?: string }

export class RecordDelivery {
  constructor(private readonly unitOfWork: UnitOfWork) {}
  execute(command: RecordDeliveryCommand) {
    return this.unitOfWork.run(async ({ workOrders, events }) => {
      const order = requireFound(await workOrders.findById(command.workOrderId, true), 'OS');
      const changed = order.recordDelivery(command.note);
      await workOrders.save(changed);
      await events.append(changed.pendingEvents);
      return { ok: true, status: changed.status };
    });
  }
}
