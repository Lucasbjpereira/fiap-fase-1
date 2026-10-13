import { randomUUID } from 'node:crypto';

export type DomainEventName =
  | 'WorkOrderReceived' | 'QuoteCalculated' | 'DiagnosisStarted' | 'QuoteSubmitted'
  | 'QuoteApproved' | 'QuoteRejected' | 'ExecutionStarted' | 'ExecutionResumed'
  | 'AdditionalRepairProposed' | 'ExecutionPaused' | 'QuoteRevised'
  | 'RepairFinished' | 'VehicleDelivered' | 'StockReceived' | 'StockWithdrawn'
  | 'PartsConsumed' | 'MinimumStockReached';

/** Fato já aceito pelo domínio. O armazenamento ocorre na mesma transação da mudança. */
export class DomainEvent {
  readonly id = randomUUID();
  readonly occurredAt = new Date();
  readonly payload: Readonly<Record<string, string | number | boolean>>;

  constructor(readonly name: DomainEventName, readonly aggregateType: 'WorkOrder' | 'Part',
    readonly aggregateId: string, payload: Record<string, string | number | boolean>) {
    this.payload = Object.freeze({ ...payload });
    Object.freeze(this);
  }
}
