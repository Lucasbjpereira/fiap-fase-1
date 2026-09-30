import { Vehicle } from '../../domain/vehicle/vehicle';
import type { VehicleRepository } from '../../domain/vehicle/vehicle-repository';
import { VehiclePlate } from '../../domain/shared/value-objects';
import { PostgresDao } from '../database/postgres-dao';

type Row = { id: number; customer_id: number; plate: string; brand: string; model: string; year: number };
const map = (row: Row) => new Vehicle(row.id, row.customer_id, new VehiclePlate(row.plate), row.brand, row.model, row.year);
export class PgVehicleRepository extends PostgresDao implements VehicleRepository {
  async findById(id: number) { const row = await this.first<Row>('SELECT * FROM vehicles WHERE id = $1', [id]); return row && map(row); }
  async findAll() { return (await this.rows<Row>('SELECT * FROM vehicles ORDER BY id')).map(map); }
  async save(vehicle: Vehicle) {
    const row = vehicle.id === undefined
      ? await this.first<Row>('INSERT INTO vehicles (customer_id, plate, brand, model, year) VALUES ($1, $2, $3, $4, $5) RETURNING *', [vehicle.customerId, vehicle.plate.value, vehicle.brand, vehicle.model, vehicle.year])
      : await this.first<Row>('UPDATE vehicles SET brand = $2, model = $3, year = $4, updated_at = now() WHERE id = $1 RETURNING *', [vehicle.id, vehicle.brand, vehicle.model, vehicle.year]);
    return map(row!);
  }
  async delete(id: number) { return (await this.rows('DELETE FROM vehicles WHERE id = $1 RETURNING id', [id])).length > 0; }
}
