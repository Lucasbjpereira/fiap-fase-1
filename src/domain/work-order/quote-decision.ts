import { Money } from '../shared/value-objects';
import { QuoteVersion } from './quote-version';
export class QuoteDecision {
  constructor(readonly approved: boolean, readonly total: Money, readonly reason?: string,
    readonly createdAt: Date = new Date(), readonly quoteVersion: QuoteVersion = new QuoteVersion(),
    readonly id?: number) { Object.freeze(this); }
}
