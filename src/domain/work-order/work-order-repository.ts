import type { WorkOrder } from './work-order';

/** Persiste o agregado completo. Não expõe escrita isolada em seus filhos. */
export interface WorkOrderRepository {
  findById(id: number, lock?: boolean): Promise<WorkOrder | undefined>;
  findByTrackingCode(code: string, lock?: boolean): Promise<WorkOrder | undefined>;
  save(order: WorkOrder): Promise<WorkOrder>;
}
