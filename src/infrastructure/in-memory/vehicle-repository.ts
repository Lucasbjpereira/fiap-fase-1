import { ApplicationError } from '../../application/errors';
import { Vehicle } from '../../domain/vehicle/vehicle';
import type { VehicleRepository } from '../../domain/vehicle/vehicle-repository';
import { nextId, type StateSession } from './state';

export class InMemoryVehicleRepository implements VehicleRepository {
  constructor(private readonly session: StateSession) {}
  async findById(id: number) { return this.session.state.vehicles.get(id); }
  async findAll() { return [...this.session.state.vehicles.values()].sort((a, b) => a.id! - b.id!); }
  async save(vehicle: Vehicle) {
    const state = this.session.state;
    if (!state.customers.has(vehicle.customerId)) throw new ApplicationError('conflict', 'Cliente não encontrado');
    if ([...state.vehicles.values()].some(existing => existing.id !== vehicle.id && existing.plate.value === vehicle.plate.value)) {
      throw new ApplicationError('conflict', 'Veículo com esta placa já existe');
    }
    const saved = new Vehicle(vehicle.id ?? nextId(state, 'vehicle'), vehicle.customerId, vehicle.plate, vehicle.brand, vehicle.model, vehicle.year);
    state.vehicles.set(saved.id!, saved);
    return saved;
  }
  async delete(id: number) {
    const state = this.session.state;
    if ([...state.workOrders.values()].some(record => record.order.vehicleId === id)) throw new ApplicationError('conflict', 'Registro possui dependências');
    return state.vehicles.delete(id);
  }
}
