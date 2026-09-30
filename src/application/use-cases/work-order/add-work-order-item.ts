import type { UnitOfWork } from '../../unit-of-work';
import { resolveOrderItem, type OrderItemRequest } from '../../resolve-order-item';
import { requireFound } from '../../require-found';

export class AddWorkOrderItem {
  constructor(private readonly unitOfWork: UnitOfWork) {}
  execute(id: number, request: OrderItemRequest) {
    return this.unitOfWork.run(async context => {
      const order = requireFound(await context.workOrders.findById(id, true), 'OS');
      const item = await resolveOrderItem(context, request);
      const changed = order.addItem(item);
      await context.workOrders.addItem(id, item);
      await context.workOrders.updateQuote(id, changed.quote.cents);
      await context.workOrders.updateStatus(id, changed.status);
      await context.workOrders.recordStatus(id, changed.history.at(-1)!);
      return { workOrderId: id, quoteTotalCents: changed.quote.cents, status: changed.status };
    });
  }
}
