import type { VehicleRepository } from '../../../domain/vehicle/vehicle-repository';
export class ListVehicles {
  constructor(private readonly repository: VehicleRepository) {}
  execute() { return this.repository.findAll(); }
}
