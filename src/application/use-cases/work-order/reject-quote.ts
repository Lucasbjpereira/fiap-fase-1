import type { UnitOfWork } from '../../unit-of-work';
import { requireFound } from '../../require-found';
import { QuoteVersion } from '../../../domain/work-order/quote-version';

export interface RejectQuoteCommand { readonly trackingCode: string; readonly quoteVersion: number; readonly reason?: string }

export class RejectQuote {
  constructor(private readonly unitOfWork: UnitOfWork) {}
  execute(command: RejectQuoteCommand) {
    return this.unitOfWork.run(async ({ workOrders, events }) => {
      const order = requireFound(await workOrders.findByTrackingCode(command.trackingCode, true), 'OS');
      const changed = order.rejectQuote(new QuoteVersion(command.quoteVersion), command.reason);
      await workOrders.save(changed);
      await events.append(changed.pendingEvents);
      return { message: 'Orçamento rejeitado', approved: false, quoteVersion: changed.quoteVersion.value };
    });
  }
}
