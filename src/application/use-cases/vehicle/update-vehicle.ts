import type { VehicleRepository } from '../../../domain/vehicle/vehicle-repository';
import { requireFound } from '../../require-found';
export class UpdateVehicle {
  constructor(private readonly repository: VehicleRepository) {}
  async execute(id: number, input: { brand?: string; model?: string; year?: number }) {
    const current = requireFound(await this.repository.findById(id), 'Veículo');
    let updated = current;
    if (input.brand !== undefined) updated = updated.changeBrand(input.brand);
    if (input.model !== undefined) updated = updated.changeModel(input.model);
    if (input.year !== undefined) updated = updated.changeYear(input.year);
    return this.repository.save(updated);
  }
}
