import type { WorkOrderQueries } from '../../work-order-queries';
import { requireFound } from '../../require-found';
export class GetWorkOrder {
  constructor(private readonly queries: WorkOrderQueries) {}
  async execute(id: number) { return requireFound(await this.queries.detail(id), 'OS'); }
}
