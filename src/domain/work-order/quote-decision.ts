import { Money } from '../shared/value-objects';
export class QuoteDecision {
  constructor(readonly approved: boolean, readonly total: Money, readonly reason?: string, readonly createdAt?: Date) {}
}
