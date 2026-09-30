import type { WorkOrderStatus } from '../work-order/status';
import type { WorkOrder } from './work-order';
import type { WorkOrderItem } from './work-order-item';
import type { QuoteDecision } from './quote-decision';
import type { StatusChange } from './status-change';

export interface WorkOrderRepository {
  findById(id: number, lock?: boolean): Promise<WorkOrder | undefined>;
  findByTrackingCode(code: string, lock?: boolean): Promise<WorkOrder | undefined>;
  insert(order: WorkOrder): Promise<WorkOrder>;
  addItem(orderId: number, item: WorkOrderItem): Promise<void>;
  updateQuote(orderId: number, totalCents: number): Promise<void>;
  updateStatus(orderId: number, status: WorkOrderStatus, effects?: { startsExecution: boolean; finishesExecution: boolean; recordsDelivery: boolean }): Promise<void>;
  recordStatus(orderId: number, change: StatusChange): Promise<void>;
  recordDecision(orderId: number, decision: QuoteDecision): Promise<void>;
  markItemConsumed(itemId: number): Promise<void>;
}
