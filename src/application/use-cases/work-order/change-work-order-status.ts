import type { WorkOrderStatus } from '../../../domain/work-order/status';
import type { UnitOfWork } from '../../unit-of-work';
import { ApplicationError } from '../../errors';
import { StartDiagnosis } from './start-diagnosis';
import { SubmitQuote } from './submit-quote';
import { FinishRepair } from './finish-repair';
import { RecordDelivery } from './record-delivery';

/** Adaptador da rota existente; regras e transações pertencem ao handler de cada comando. */
export class ChangeWorkOrderStatus {
  private readonly diagnosis: StartDiagnosis;
  private readonly submit: SubmitQuote;
  private readonly finish: FinishRepair;
  private readonly deliver: RecordDelivery;
  constructor(unitOfWork: UnitOfWork) {
    this.diagnosis = new StartDiagnosis(unitOfWork);
    this.submit = new SubmitQuote(unitOfWork);
    this.finish = new FinishRepair(unitOfWork);
    this.deliver = new RecordDelivery(unitOfWork);
  }
  execute(id: number, target: WorkOrderStatus, note?: string) {
    const command = { workOrderId: id, note };
    switch (target) {
      case 'DIAGNOSIS': return this.diagnosis.execute(command);
      case 'AWAITING_APPROVAL': return this.submit.execute(command);
      case 'FINISHED': return this.finish.execute(command);
      case 'DELIVERED': return this.deliver.execute(command);
      default: throw new ApplicationError('conflict', 'Transição inválida; execução exige aprovação do orçamento');
    }
  }
}
