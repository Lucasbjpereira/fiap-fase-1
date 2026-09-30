import type { CustomerRepository } from '../domain/customer/customer-repository';
import type { VehicleRepository } from '../domain/vehicle/vehicle-repository';
import type { ServiceRepository } from '../domain/service/service-repository';
import type { PartRepository } from '../domain/part/part-repository';
import type { WorkOrderRepository } from '../domain/work-order/work-order-repository';
import type { WorkshopRepository } from '../domain/workshop/workshop-repository';
import type { AdminUserRepository } from '../domain/identity/admin-user-repository';

export interface RepositoryContext {
  customers: CustomerRepository;
  vehicles: VehicleRepository;
  services: ServiceRepository;
  parts: PartRepository;
  workOrders: WorkOrderRepository;
  workshops: WorkshopRepository;
  users: AdminUserRepository;
}
export interface UnitOfWork {
  run<T>(operation: (context: RepositoryContext) => Promise<T>): Promise<T>;
}
