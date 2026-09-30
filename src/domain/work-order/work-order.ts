import { DomainError } from '../shared/domain-error';
import { canTransition, type WorkOrderStatus } from '../work-order/status';
import { Money, TrackingCode } from '../shared/value-objects';
import { WorkOrderItem } from './work-order-item';
import { QuoteDecision } from './quote-decision';
import { StatusChange } from './status-change';

export class WorkOrder {
  constructor(readonly id: number | undefined, readonly customerId: number, readonly vehicleId: number,
    readonly complaint: string, readonly trackingCode: TrackingCode, readonly status: WorkOrderStatus,
    readonly items: readonly WorkOrderItem[] = [], readonly decisions: readonly QuoteDecision[] = [],
    readonly history: readonly StatusChange[] = []) {
    if (!Number.isSafeInteger(customerId) || customerId <= 0 || !Number.isSafeInteger(vehicleId) || vehicleId <= 0 || complaint.trim().length < 3) throw new DomainError('Ordem de serviço inválida');
  }
  static create(customerId: number, vehicleId: number, complaint: string, items: WorkOrderItem[]): WorkOrder {
    if (!items.length) throw new DomainError('A OS deve conter ao menos um serviço ou peça');
    return new WorkOrder(undefined, customerId, vehicleId, complaint.trim(), TrackingCode.generate(), 'RECEIVED', items, [], [new StatusChange(null, 'RECEIVED', 'OS criada')]);
  }
  get quote(): Money { return this.items.reduce((sum, item) => sum.add(item.total), new Money(0)); }
  addItem(item: WorkOrderItem): WorkOrder {
    if (this.status !== 'IN_PROGRESS') throw new DomainError('Reparos adicionais só podem ser propostos durante a execução', 'conflict');
    return new WorkOrder(this.id, this.customerId, this.vehicleId, this.complaint, this.trackingCode, 'AWAITING_APPROVAL', [...this.items, item], this.decisions,
      [...this.history, new StatusChange('IN_PROGRESS', 'AWAITING_APPROVAL', 'Reparo adicional proposto; aguardando nova aprovação')]);
  }
  decide(approved: boolean, reason?: string): WorkOrder {
    if (this.status !== 'AWAITING_APPROVAL') throw new DomainError('OS não está aguardando aprovação', 'conflict');
    const decisions = [...this.decisions, new QuoteDecision(approved, this.quote, reason)];
    if (!approved) return new WorkOrder(this.id, this.customerId, this.vehicleId, this.complaint, this.trackingCode, this.status, this.items, decisions, this.history);
    return new WorkOrder(this.id, this.customerId, this.vehicleId, this.complaint, this.trackingCode, 'IN_PROGRESS', this.items, decisions,
      [...this.history, new StatusChange('AWAITING_APPROVAL', 'IN_PROGRESS', 'Orçamento aprovado pelo cliente')]);
  }
  transition(target: WorkOrderStatus, note?: string): WorkOrder {
    if (this.status === 'AWAITING_APPROVAL' && target === 'IN_PROGRESS') throw new DomainError('A execução exige aprovação do orçamento pelo cliente', 'conflict');
    if (this.status === 'IN_PROGRESS' && target === 'AWAITING_APPROVAL') throw new DomainError('Use a inclusão de reparo adicional para gerar nova aprovação', 'conflict');
    if (!canTransition(this.status, target)) throw new DomainError(`Transição inválida: ${this.status} -> ${target}`, 'conflict');
    return new WorkOrder(this.id, this.customerId, this.vehicleId, this.complaint, this.trackingCode, target, this.items, this.decisions,
      [...this.history, new StatusChange(this.status, target, note)]);
  }
}
