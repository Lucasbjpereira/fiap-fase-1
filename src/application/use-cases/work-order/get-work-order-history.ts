import type { WorkOrderRepository } from '../../../domain/work-order/work-order-repository';
import type { WorkOrderQueries } from '../../work-order-queries';
import { requireFound } from '../../require-found';
export class GetWorkOrderHistory {
  constructor(private readonly repository: WorkOrderRepository, private readonly queries: WorkOrderQueries) {}
  async execute(id: number) {
    requireFound(await this.repository.findById(id), 'OS');
    return this.queries.history(id);
  }
}
