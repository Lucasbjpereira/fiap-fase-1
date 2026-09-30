export interface WorkOrderQueries {
  list(status?: string, limit?: number, offset?: number): Promise<Record<string, unknown>[]>;
  detail(id: number): Promise<Record<string, unknown> | undefined>;
  publicView(trackingCode: string): Promise<Record<string, unknown> | undefined>;
  history(id: number): Promise<Record<string, unknown>[]>;
  averageExecutionMinutes(): Promise<{ completed_orders: number; average_minutes: string | null }>;
}
