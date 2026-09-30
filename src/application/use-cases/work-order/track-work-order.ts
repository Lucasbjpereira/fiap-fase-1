import type { WorkOrderQueries } from '../../work-order-queries';
import { requireFound } from '../../require-found';
export class TrackWorkOrder {
  constructor(private readonly queries: WorkOrderQueries) {}
  async execute(code: string) { return requireFound(await this.queries.publicView(code), 'OS'); }
}
