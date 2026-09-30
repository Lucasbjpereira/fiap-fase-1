import type { Vehicle } from './vehicle';
export interface VehicleRepository {
  findById(id: number): Promise<Vehicle | undefined>;
  findAll(): Promise<Vehicle[]>;
  save(vehicle: Vehicle): Promise<Vehicle>;
  delete(id: number): Promise<boolean>;
}
