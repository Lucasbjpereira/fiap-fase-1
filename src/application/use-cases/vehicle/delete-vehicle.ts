import type { VehicleRepository } from '../../../domain/vehicle/vehicle-repository';
import { ApplicationError } from '../../errors';
export class DeleteVehicle {
  constructor(private readonly repository: VehicleRepository) {}
  async execute(id: number) {
    if (!(await this.repository.delete(id))) throw new ApplicationError('not_found', 'Veículo não encontrado');
    return { deleted: true };
  }
}
