import type { UnitOfWork } from '../../unit-of-work';
import { InventoryMovement } from '../../../domain/part/inventory-movement';
import { ApplicationError } from '../../errors';
import { requireFound } from '../../require-found';

export class DecideQuote {
  constructor(private readonly unitOfWork: UnitOfWork) {}
  execute(trackingCode: string, approved: boolean, reason?: string) {
    return this.unitOfWork.run(async context => {
      const order = requireFound(await context.workOrders.findByTrackingCode(trackingCode, true), 'OS');
      const changed = order.decide(approved, reason);
      await context.workOrders.recordDecision(order.id!, changed.decisions.at(-1)!);
      if (approved) {
        for (const item of order.items.filter(item => item.kind === 'PART' && !item.consumed)) {
          if (!(await context.parts.consume(item.catalogId, item.quantity.value))) throw new ApplicationError('conflict', 'Estoque insuficiente para aprovar o orçamento');
          await context.parts.recordMovement(new InventoryMovement(undefined, item.catalogId, -item.quantity.value, 'Consumo na OS', order.id));
          await context.workOrders.markItemConsumed(item.id!);
        }
        await context.workOrders.updateStatus(order.id!, changed.status, { startsExecution: true, finishesExecution: false, recordsDelivery: false });
        await context.workOrders.recordStatus(order.id!, changed.history.at(-1)!);
      }
      return { message: approved ? 'Orçamento aprovado; serviço iniciado' : 'Orçamento rejeitado', approved };
    });
  }
}
