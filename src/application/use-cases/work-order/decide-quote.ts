import type { UnitOfWork } from '../../unit-of-work';
import { ApproveQuote } from './approve-quote';
import { RejectQuote } from './reject-quote';

/** Compatibilidade com a rota /decision; cada decisão tem seu próprio handler. */
export class DecideQuote {
  private readonly approve: ApproveQuote;
  private readonly reject: RejectQuote;
  constructor(unitOfWork: UnitOfWork) {
    this.approve = new ApproveQuote(unitOfWork);
    this.reject = new RejectQuote(unitOfWork);
  }
  execute(trackingCode: string, approved: boolean, quoteVersion: number, reason?: string) {
    const command = { trackingCode, reason, quoteVersion };
    return approved ? this.approve.execute(command) : this.reject.execute(command);
  }
}
