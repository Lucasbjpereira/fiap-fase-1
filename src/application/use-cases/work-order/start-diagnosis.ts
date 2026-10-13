import type { UnitOfWork } from '../../unit-of-work';
import { requireFound } from '../../require-found';

export interface StartDiagnosisCommand { readonly workOrderId: number; readonly note?: string }

export class StartDiagnosis {
  constructor(private readonly unitOfWork: UnitOfWork) {}
  execute(command: StartDiagnosisCommand) {
    return this.unitOfWork.run(async ({ workOrders, events }) => {
      const order = requireFound(await workOrders.findById(command.workOrderId, true), 'OS');
      const changed = order.startDiagnosis(command.note);
      await workOrders.save(changed);
      await events.append(changed.pendingEvents);
      return { ok: true, status: changed.status };
    });
  }
}
