import type { UnitOfWork } from '../../unit-of-work';
import { resolveOrderItem, type OrderItemRequest } from '../../resolve-order-item';
import { requireFound } from '../../require-found';

export interface ProposeAdditionalRepairCommand { readonly workOrderId: number; readonly item: OrderItemRequest }

export class ProposeAdditionalRepair {
  constructor(private readonly unitOfWork: UnitOfWork) {}
  execute(command: ProposeAdditionalRepairCommand) {
    return this.unitOfWork.run(async context => {
      const order = requireFound(await context.workOrders.findById(command.workOrderId, true), 'OS');
      const item = await resolveOrderItem(context, command.item);
      const changed = order.proposeAdditionalRepair(item);
      await context.workOrders.save(changed);
      await context.events.append(changed.pendingEvents);
      return { workOrderId: command.workOrderId, quoteTotalCents: changed.quote.cents, status: changed.status, quoteVersion: changed.quoteVersion.value };
    });
  }
}
