import { WorkOrder } from '../../domain/work-order/work-order';
import { WorkOrderItem, type ItemKind } from '../../domain/work-order/work-order-item';
import { QuoteDecision } from '../../domain/work-order/quote-decision';
import { StatusChange } from '../../domain/work-order/status-change';
import type { WorkOrderRepository } from '../../domain/work-order/work-order-repository';
import type { WorkOrderStatus } from '../../domain/work-order/status';
import { Money, Quantity, TrackingCode } from '../../domain/shared/value-objects';
import { PostgresDao } from '../database/postgres-dao';

type Row = { id: number; customer_id: number; vehicle_id: number; complaint: string; tracking_code: string; status: WorkOrderStatus; quote_total_cents: number };
type ItemRow = { id: number; kind: ItemKind; service_id: number | null; part_id: number | null; description: string; quantity: number; unit_price_cents: number; consumed: boolean };
export class PgWorkOrderRepository extends PostgresDao implements WorkOrderRepository {
  private async hydrate(row: Row): Promise<WorkOrder> {
    const items = await this.rows<ItemRow>('SELECT * FROM order_items WHERE work_order_id = $1 ORDER BY id', [row.id]);
    const decisions = await this.rows<{ approved: boolean; quote_total_cents: number; reason: string | null; created_at: Date }>('SELECT * FROM quote_decisions WHERE work_order_id = $1 ORDER BY id', [row.id]);
    const history = await this.rows<{ from_status: WorkOrderStatus | null; to_status: WorkOrderStatus; note: string | null; created_at: Date }>('SELECT * FROM status_history WHERE work_order_id = $1 ORDER BY id', [row.id]);
    return new WorkOrder(row.id, row.customer_id, row.vehicle_id, row.complaint, new TrackingCode(row.tracking_code), row.status,
      items.map(item => new WorkOrderItem(item.id, item.kind, item.service_id ?? item.part_id!, item.description, new Quantity(item.quantity), new Money(item.unit_price_cents), item.consumed)),
      decisions.map(decision => new QuoteDecision(decision.approved, new Money(decision.quote_total_cents), decision.reason ?? undefined, decision.created_at)),
      history.map(change => new StatusChange(change.from_status, change.to_status, change.note ?? undefined, change.created_at)));
  }
  async findById(id: number, lock = false) {
    const row = await this.first<Row>(`SELECT * FROM work_orders WHERE id = $1${lock ? ' FOR UPDATE' : ''}`, [id]);
    return row && this.hydrate(row);
  }
  async findByTrackingCode(code: string, lock = false) {
    const row = await this.first<Row>(`SELECT * FROM work_orders WHERE tracking_code = $1${lock ? ' FOR UPDATE' : ''}`, [code]);
    return row && this.hydrate(row);
  }
  async insert(order: WorkOrder) {
    const row = await this.first<Row>('INSERT INTO work_orders (tracking_code, customer_id, vehicle_id, complaint, quote_total_cents) VALUES ($1, $2, $3, $4, $5) RETURNING *', [order.trackingCode.value, order.customerId, order.vehicleId, order.complaint, order.quote.cents]);
    return new WorkOrder(row!.id, order.customerId, order.vehicleId, order.complaint, order.trackingCode, 'RECEIVED', order.items, order.decisions, order.history);
  }
  async addItem(orderId: number, item: WorkOrderItem) {
    await this.rows('INSERT INTO order_items (work_order_id, kind, service_id, part_id, description, quantity, unit_price_cents) VALUES ($1, $2, $3, $4, $5, $6, $7)', [orderId, item.kind, item.kind === 'SERVICE' ? item.catalogId : null, item.kind === 'PART' ? item.catalogId : null, item.description, item.quantity.value, item.unitPrice.cents]);
  }
  async updateQuote(orderId: number, totalCents: number) { await this.rows('UPDATE work_orders SET quote_total_cents = $2, updated_at = now() WHERE id = $1', [orderId, totalCents]); }
  async updateStatus(orderId: number, status: WorkOrderStatus, effects = { startsExecution: false, finishesExecution: false, recordsDelivery: false }) {
    await this.rows('UPDATE work_orders SET status = $2, started_at = CASE WHEN $3 THEN COALESCE(started_at, now()) ELSE started_at END, finished_at = CASE WHEN $4 THEN now() ELSE finished_at END, delivered_at = CASE WHEN $5 THEN now() ELSE delivered_at END, updated_at = now() WHERE id = $1', [orderId, status, effects.startsExecution, effects.finishesExecution, effects.recordsDelivery]);
  }
  async recordStatus(orderId: number, change: StatusChange) { await this.rows('INSERT INTO status_history (work_order_id, from_status, to_status, note) VALUES ($1, $2, $3, $4)', [orderId, change.from, change.to, change.note ?? null]); }
  async recordDecision(orderId: number, decision: QuoteDecision) { await this.rows('INSERT INTO quote_decisions (work_order_id, approved, reason, quote_total_cents) VALUES ($1, $2, $3, $4)', [orderId, decision.approved, decision.reason ?? null, decision.total.cents]); }
  async markItemConsumed(itemId: number) { await this.rows('UPDATE order_items SET consumed = true WHERE id = $1', [itemId]); }
}
