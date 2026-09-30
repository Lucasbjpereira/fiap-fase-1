export const workOrderStatuses = [
  'RECEIVED', 'DIAGNOSIS', 'AWAITING_APPROVAL', 'IN_PROGRESS', 'FINISHED', 'DELIVERED'
] as const;
export type WorkOrderStatus = typeof workOrderStatuses[number];

const allowedTransitions: Record<WorkOrderStatus, WorkOrderStatus[]> = {
  RECEIVED: ['DIAGNOSIS'],
  DIAGNOSIS: ['AWAITING_APPROVAL'],
  AWAITING_APPROVAL: ['IN_PROGRESS'],
  IN_PROGRESS: ['FINISHED', 'AWAITING_APPROVAL'],
  FINISHED: ['DELIVERED'],
  DELIVERED: []
};

export function canTransition(from: WorkOrderStatus, to: WorkOrderStatus): boolean {
  return allowedTransitions[from]?.includes(to) ?? false;
}

export function assertTransition(from: WorkOrderStatus, to: WorkOrderStatus): void {
  if (!canTransition(from, to)) throw new Error(`Transição inválida: ${from} -> ${to}`);
}

