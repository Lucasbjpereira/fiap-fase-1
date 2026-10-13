import type { UnitOfWork } from '../../unit-of-work';
import { ReceiveStock } from './receive-stock';
import { WithdrawStock } from './withdraw-stock';

/** Adaptador da rota de movimentações: direciona para o comando de entrada ou saída. */
export class AdjustStock {
  private readonly receive: ReceiveStock;
  private readonly withdraw: WithdrawStock;
  constructor(unitOfWork: UnitOfWork) {
    this.receive = new ReceiveStock(unitOfWork);
    this.withdraw = new WithdrawStock(unitOfWork);
  }
  execute(id: number, delta: number, reason: string) {
    const command = { partId: id, quantity: Math.abs(delta), reason };
    return delta > 0 ? this.receive.execute(command) : this.withdraw.execute(command);
  }
}
