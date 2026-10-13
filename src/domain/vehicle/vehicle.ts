import { DomainError } from '../shared/domain-error';
import { VehiclePlate } from '../shared/value-objects';

export class Vehicle {
  constructor(readonly id: number | undefined, readonly customerId: number, readonly plate: VehiclePlate,
    readonly brand: string, readonly model: string, readonly year: number) {
    if (!Number.isSafeInteger(customerId) || customerId <= 0) throw new DomainError('Cliente inválido');
    Object.freeze(this);
    if (!brand.trim() || !model.trim() || !Number.isSafeInteger(year) || year < 1950 || year > 2100) throw new DomainError('Veículo inválido');
  }
  static create(input: { customerId: number; plate: string; brand: string; model: string; year: number }): Vehicle {
    return new Vehicle(undefined, input.customerId, new VehiclePlate(input.plate), input.brand.trim(), input.model.trim(), input.year);
  }
  changeBrand(brand: string): Vehicle {
    return new Vehicle(this.id, this.customerId, this.plate, brand.trim(), this.model, this.year);
  }
  changeModel(model: string): Vehicle {
    return new Vehicle(this.id, this.customerId, this.plate, this.brand, model.trim(), this.year);
  }
  changeYear(year: number): Vehicle {
    return new Vehicle(this.id, this.customerId, this.plate, this.brand, this.model, year);
  }
  belongsTo(customerId: number): boolean { return this.customerId === customerId; }
}
