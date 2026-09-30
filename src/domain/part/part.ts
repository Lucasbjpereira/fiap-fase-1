import { DomainError } from '../shared/domain-error';
import { Money } from '../shared/value-objects';

export class Part {
  constructor(readonly id: number | undefined, readonly sku: string, readonly name: string,
    readonly description: string | undefined, readonly price: Money, readonly stockQuantity: number,
    readonly minimumStock: number, readonly active: boolean = true) {
    if (!sku.trim() || !name.trim() || !Number.isSafeInteger(stockQuantity) || stockQuantity < 0 ||
      !Number.isSafeInteger(minimumStock) || minimumStock < 0) throw new DomainError('Peça ou saldo inválido');
  }
  static create(input: { sku: string; name: string; description?: string; priceCents: number; stockQuantity?: number; minimumStock?: number }): Part {
    return new Part(undefined, input.sku.trim(), input.name.trim(), input.description, new Money(input.priceCents), input.stockQuantity ?? 0, input.minimumStock ?? 0);
  }
  rename(name: string): Part {
    return new Part(this.id, this.sku, name.trim(), this.description, this.price, this.stockQuantity, this.minimumStock, this.active);
  }
  changeDescription(description: string): Part {
    return new Part(this.id, this.sku, this.name, description, this.price, this.stockQuantity, this.minimumStock, this.active);
  }
  changePrice(price: Money): Part {
    return new Part(this.id, this.sku, this.name, this.description, price, this.stockQuantity, this.minimumStock, this.active);
  }
  changeMinimumStock(minimumStock: number): Part {
    return new Part(this.id, this.sku, this.name, this.description, this.price, this.stockQuantity, minimumStock, this.active);
  }
  activate(): Part {
    return new Part(this.id, this.sku, this.name, this.description, this.price, this.stockQuantity, this.minimumStock, true);
  }
  deactivate(): Part {
    return new Part(this.id, this.sku, this.name, this.description, this.price, this.stockQuantity, this.minimumStock, false);
  }
  receiveStock(quantity: number): Part {
    if (!Number.isSafeInteger(quantity) || quantity <= 0) throw new DomainError('Quantidade da movimentação inválida');
    return new Part(this.id, this.sku, this.name, this.description, this.price, this.stockQuantity + quantity, this.minimumStock, this.active);
  }
  withdrawStock(quantity: number): Part {
    if (!Number.isSafeInteger(quantity) || quantity <= 0) throw new DomainError('Quantidade da movimentação inválida');
    if (this.stockQuantity < quantity) throw new DomainError('Estoque não pode ficar negativo', 'conflict');
    return new Part(this.id, this.sku, this.name, this.description, this.price, this.stockQuantity - quantity, this.minimumStock, this.active);
  }
  ensureAvailable(quantity: number): void {
    if (!this.active || this.stockQuantity < quantity) throw new DomainError('Estoque insuficiente ou peça indisponível', 'conflict');
  }
}
