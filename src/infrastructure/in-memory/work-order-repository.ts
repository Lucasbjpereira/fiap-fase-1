import { ApplicationError } from '../../application/errors';
import { WorkOrder } from '../../domain/work-order/work-order';
import { WorkOrderItem } from '../../domain/work-order/work-order-item';
import { QuoteDecision } from '../../domain/work-order/quote-decision';
import { StatusChange } from '../../domain/work-order/status-change';
import type { WorkOrderRepository } from '../../domain/work-order/work-order-repository';
import type { WorkOrderStatus } from '../../domain/work-order/status';
import { nextId, type StateSession, type StoredWorkOrder } from './state';

function copyOrder(order: WorkOrder, changes: {
  status?: WorkOrderStatus;
  items?: readonly WorkOrderItem[];
  decisions?: readonly QuoteDecision[];
  history?: readonly StatusChange[];
}): WorkOrder {
  return new WorkOrder(order.id, order.customerId, order.vehicleId, order.complaint, order.trackingCode,
    changes.status ?? order.status, changes.items ?? order.items, changes.decisions ?? order.decisions, changes.history ?? order.history);
}

export class InMemoryWorkOrderRepository implements WorkOrderRepository {
  constructor(private readonly session: StateSession) {}

  private record(id: number): StoredWorkOrder {
    const record = this.session.state.workOrders.get(id);
    if (!record) throw new ApplicationError('not_found', 'OS não encontrada');
    return record;
  }

  private update(id: number, changes: Partial<StoredWorkOrder>): void {
    this.session.state.workOrders.set(id, { ...this.record(id), ...changes, updatedAt: new Date() });
  }

  async findById(id: number, _lock = false) { return this.session.state.workOrders.get(id)?.order; }
  async findByTrackingCode(code: string, _lock = false) {
    return [...this.session.state.workOrders.values()].find(record => record.order.trackingCode.value === code)?.order;
  }
  async insert(order: WorkOrder) {
    const state = this.session.state;
    const vehicle = state.vehicles.get(order.vehicleId);
    if (!state.customers.has(order.customerId) || !vehicle || vehicle.customerId !== order.customerId) {
      throw new ApplicationError('conflict', 'Cliente ou veículo inválido');
    }
    if ([...state.workOrders.values()].some(record => record.order.trackingCode.value === order.trackingCode.value)) {
      throw new ApplicationError('conflict', 'Código de acompanhamento duplicado');
    }
    const id = nextId(state, 'workOrder');
    const now = new Date();
    const persisted = new WorkOrder(id, order.customerId, order.vehicleId, order.complaint, order.trackingCode, order.status);
    state.workOrders.set(id, { order: persisted, quoteTotalCents: order.quote.cents, openedAt: now, updatedAt: now });
    return new WorkOrder(id, order.customerId, order.vehicleId, order.complaint, order.trackingCode, order.status,
      order.items, order.decisions, order.history);
  }
  async addItem(orderId: number, item: WorkOrderItem) {
    const state = this.session.state;
    const catalogExists = item.kind === 'SERVICE' ? state.services.has(item.catalogId) : state.parts.has(item.catalogId);
    if (!catalogExists) throw new ApplicationError('conflict', 'Item de catálogo não encontrado');
    const record = this.record(orderId);
    const saved = new WorkOrderItem(nextId(state, 'workOrderItem'), item.kind, item.catalogId, item.description, item.quantity, item.unitPrice, item.consumed);
    this.update(orderId, { order: copyOrder(record.order, { items: [...record.order.items, saved] }) });
  }
  async updateQuote(orderId: number, totalCents: number) { this.update(orderId, { quoteTotalCents: totalCents }); }
  async updateStatus(orderId: number, status: WorkOrderStatus, effects = { startsExecution: false, finishesExecution: false, recordsDelivery: false }) {
    const record = this.record(orderId);
    const now = new Date();
    this.update(orderId, {
      order: copyOrder(record.order, { status }),
      startedAt: effects.startsExecution ? record.startedAt ?? now : record.startedAt,
      finishedAt: effects.finishesExecution ? now : record.finishedAt,
      deliveredAt: effects.recordsDelivery ? now : record.deliveredAt
    });
  }
  async recordStatus(orderId: number, change: StatusChange) {
    const record = this.record(orderId);
    this.update(orderId, { order: copyOrder(record.order, { history: [...record.order.history, new StatusChange(change.from, change.to, change.note, new Date())] }) });
  }
  async recordDecision(orderId: number, decision: QuoteDecision) {
    const record = this.record(orderId);
    this.update(orderId, { order: copyOrder(record.order, { decisions: [...record.order.decisions, new QuoteDecision(decision.approved, decision.total, decision.reason, new Date())] }) });
  }
  async markItemConsumed(itemId: number) {
    for (const [orderId, record] of this.session.state.workOrders) {
      const item = record.order.items.find(current => current.id === itemId);
      if (!item) continue;
      const items = record.order.items.map(current => current.id === itemId
        ? new WorkOrderItem(current.id, current.kind, current.catalogId, current.description, current.quantity, current.unitPrice, true)
        : current);
      this.update(orderId, { order: copyOrder(record.order, { items }) });
      return;
    }
    throw new ApplicationError('not_found', 'Item da OS não encontrado');
  }
}
