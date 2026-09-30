import { DomainError } from '../shared/domain-error';
import { Money } from '../shared/value-objects';

export class Service {
  constructor(readonly id: number | undefined, readonly name: string, readonly description: string | undefined,
    readonly price: Money, readonly estimatedMinutes: number, readonly active: boolean = true) {
    if (!name.trim() || !Number.isSafeInteger(estimatedMinutes) || estimatedMinutes <= 0) throw new DomainError('Serviço inválido');
  }
  static create(input: { name: string; description?: string; priceCents: number; estimatedMinutes: number }): Service {
    return new Service(undefined, input.name.trim(), input.description, new Money(input.priceCents), input.estimatedMinutes);
  }
  rename(name: string): Service {
    return new Service(this.id, name.trim(), this.description, this.price, this.estimatedMinutes, this.active);
  }
  changeDescription(description: string): Service {
    return new Service(this.id, this.name, description, this.price, this.estimatedMinutes, this.active);
  }
  changePrice(price: Money): Service {
    return new Service(this.id, this.name, this.description, price, this.estimatedMinutes, this.active);
  }
  changeEstimatedMinutes(minutes: number): Service {
    return new Service(this.id, this.name, this.description, this.price, minutes, this.active);
  }
  activate(): Service {
    return new Service(this.id, this.name, this.description, this.price, this.estimatedMinutes, true);
  }
  deactivate(): Service {
    return new Service(this.id, this.name, this.description, this.price, this.estimatedMinutes, false);
  }
}
