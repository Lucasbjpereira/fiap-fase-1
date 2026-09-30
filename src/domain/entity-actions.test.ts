import { describe, expect, it } from 'bun:test';
import { Customer } from './customer/customer';
import { Vehicle } from './vehicle/vehicle';
import { Service } from './service/service';
import { Part } from './part/part';
import { Money } from './shared/value-objects';

describe('ações explícitas das entidades', () => {
  it('altera nome e contato do cliente preservando o documento', () => {
    const original = Customer.create({ name: 'Marina Souza', document: '52998224725' });
    const changed = original.rename('Marina Oliveira').changeEmail('marina@example.test').changePhone('11999990000');
    expect(changed.name).toBe('Marina Oliveira');
    expect(changed.email).toBe('marina@example.test');
    expect(changed.phone).toBe('11999990000');
    expect(changed.document.value).toBe(original.document.value);
    expect(() => original.rename('')).toThrow();
  });

  it('altera identificação do veículo preservando placa e cliente', () => {
    const original = Vehicle.create({ customerId: 1, plate: 'ABC1D23', brand: 'Honda', model: 'Civic', year: 2022 });
    const changed = original.changeBrand('Toyota').changeModel('Corolla').changeYear(2024);
    expect([changed.brand, changed.model, changed.year]).toEqual(['Toyota', 'Corolla', 2024]);
    expect(changed.plate.value).toBe(original.plate.value);
    expect(changed.customerId).toBe(original.customerId);
    expect(() => original.changeYear(1900)).toThrow();
  });

  it('altera preço, duração e disponibilidade do serviço', () => {
    const original = Service.create({ name: 'Revisão', priceCents: 10000, estimatedMinutes: 60 });
    const changed = original.rename('Revisão completa').changeDescription('Inspeção geral')
      .changePrice(new Money(15000)).changeEstimatedMinutes(90).deactivate().activate();
    expect(changed.name).toBe('Revisão completa');
    expect(changed.description).toBe('Inspeção geral');
    expect(changed.price.cents).toBe(15000);
    expect(changed.estimatedMinutes).toBe(90);
    expect(changed.active).toBe(true);
    expect(original.deactivate().active).toBe(false);
    expect(() => original.changeEstimatedMinutes(0)).toThrow();
  });

  it('altera catálogo e estoque da peça sem permitir saldo negativo', () => {
    const original = Part.create({ sku: 'FILTRO-1', name: 'Filtro', priceCents: 3500, stockQuantity: 2 });
    const changed = original.rename('Filtro de óleo').changeDescription('Compatível com Civic')
      .changePrice(new Money(4000)).changeMinimumStock(1).deactivate().activate()
      .receiveStock(3).withdrawStock(2);
    expect(changed.name).toBe('Filtro de óleo');
    expect(changed.description).toBe('Compatível com Civic');
    expect(changed.price.cents).toBe(4000);
    expect(changed.minimumStock).toBe(1);
    expect(changed.stockQuantity).toBe(3);
    expect(changed.active).toBe(true);
    expect(original.deactivate().active).toBe(false);
    expect(() => original.withdrawStock(3)).toThrow();
  });
});
