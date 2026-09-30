import type { Service } from './service';
export interface ServiceRepository {
  findById(id: number): Promise<Service | undefined>;
  findAll(): Promise<Service[]>;
  save(service: Service): Promise<Service>;
}
