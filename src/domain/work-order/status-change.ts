import type { WorkOrderStatus } from '../work-order/status';
export class StatusChange {
  constructor(readonly from: WorkOrderStatus | null, readonly to: WorkOrderStatus,
    readonly note?: string, readonly createdAt?: Date) {}
}
