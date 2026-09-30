import type { WorkOrderQueries } from '../../work-order-queries';
export class ListWorkOrders {
  constructor(private readonly queries: WorkOrderQueries) {}
  execute(status?: string, limit?: string, offset?: string) {
    return this.queries.list(status, Math.min(100, Math.max(1, Number(limit) || 50)), Math.max(0, Number(offset) || 0));
  }
}
