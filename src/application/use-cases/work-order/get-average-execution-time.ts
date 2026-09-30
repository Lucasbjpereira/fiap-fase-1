import type { WorkOrderQueries } from '../../work-order-queries';
export class GetAverageExecutionTime {
  constructor(private readonly queries: WorkOrderQueries) {}
  async execute() { return { ...await this.queries.averageExecutionMinutes(), unit: 'minutes', definition: 'Média entre início da execução e finalização das OS concluídas' }; }
}
