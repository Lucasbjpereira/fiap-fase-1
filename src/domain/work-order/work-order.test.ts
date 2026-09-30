import { describe, expect, it } from 'bun:test';
import { WorkOrder } from './work-order';
import { WorkOrderItem } from './work-order-item';
import { Money, Quantity } from '../shared/value-objects';

describe('agregado Ordem de Serviço', () => {
  const service = () => new WorkOrderItem(undefined, 'SERVICE', 1, 'Revisão', new Quantity(2), new Money(12500));
  it('calcula o orçamento e guarda o primeiro evento', () => {
    const order = WorkOrder.create(1, 2, 'Revisão preventiva', [service()]);
    expect(order.quote.cents).toBe(25000);
    expect(order.history[0].to).toBe('RECEIVED');
  });
  it('não permite iniciar reparo sem aprovação', () => {
    const order = WorkOrder.create(1, 2, 'Revisão preventiva', [service()])
      .transition('DIAGNOSIS').transition('AWAITING_APPROVAL');
    expect(() => order.transition('IN_PROGRESS')).toThrow();
    const approved = order.decide(true);
    expect(approved.status).toBe('IN_PROGRESS');
    expect(approved.decisions).toHaveLength(1);
  });
  it('reparo adicional exige nova aprovação', () => {
    const order = WorkOrder.create(1, 2, 'Revisão preventiva', [service()])
      .transition('DIAGNOSIS').transition('AWAITING_APPROVAL').decide(true);
    const additional = order.addItem(new WorkOrderItem(undefined, 'PART', 1, 'Filtro', new Quantity(1), new Money(3500)));
    expect(additional.status).toBe('AWAITING_APPROVAL');
    expect(additional.quote.cents).toBe(28500);
  });
});
