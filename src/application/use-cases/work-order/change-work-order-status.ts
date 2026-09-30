import type { WorkOrderStatus } from '../../../domain/work-order/status';
import type { UnitOfWork } from '../../unit-of-work';
import { requireFound } from '../../require-found';

export class ChangeWorkOrderStatus {
  constructor(private readonly unitOfWork: UnitOfWork) {}
  execute(id: number, target: WorkOrderStatus, note?: string) {
    return this.unitOfWork.run(async ({ workOrders }) => {
      const order = requireFound(await workOrders.findById(id, true), 'OS');
      const changed = order.transition(target, note);
      await workOrders.updateStatus(id, target, {
        startsExecution: target === 'IN_PROGRESS', finishesExecution: target === 'FINISHED', recordsDelivery: target === 'DELIVERED'
      });
      await workOrders.recordStatus(id, changed.history.at(-1)!);
      return { ok: true, status: target };
    });
  }
}
