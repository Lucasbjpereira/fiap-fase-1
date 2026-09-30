import { Vehicle } from '../../../domain/vehicle/vehicle';
import type { VehicleRepository } from '../../../domain/vehicle/vehicle-repository';
import type { CustomerRepository } from '../../../domain/customer/customer-repository';
import { requireFound } from '../../require-found';
export class CreateVehicle {
  constructor(private readonly repository: VehicleRepository, private readonly customers: CustomerRepository) {}
  async execute(input: Parameters<typeof Vehicle.create>[0]) {
    const vehicle = Vehicle.create(input);
    requireFound(await this.customers.findById(vehicle.customerId), 'Cliente');
    return this.repository.save(vehicle);
  }
}
