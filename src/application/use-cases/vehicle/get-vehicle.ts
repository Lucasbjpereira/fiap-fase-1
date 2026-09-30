import type { VehicleRepository } from '../../../domain/vehicle/vehicle-repository';
import { requireFound } from '../../require-found';
export class GetVehicle {
  constructor(private readonly repository: VehicleRepository) {}
  async execute(id: number) { return requireFound(await this.repository.findById(id), 'Veículo'); }
}
