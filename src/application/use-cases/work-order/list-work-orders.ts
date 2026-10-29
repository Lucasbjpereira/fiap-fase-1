import type { WorkOrderStatus } from '../../../domain/work-order/status';
import type { WorkOrderQueries } from '../../work-order-queries';
export class ListWorkOrders {
  constructor(private readonly queries: WorkOrderQueries) {}
  execute(status?: WorkOrderStatus, limit?: number, offset?: number) {
    return this.queries.list(status, Math.min(100, Math.max(1, limit ?? 50)), Math.max(0, offset ?? 0));
  }
}
