import { InMemoryDomainEventStore } from './domain-event-store';
import type { RepositoryContext } from '../../application/unit-of-work';
import { InMemoryCustomerRepository } from './customer-repository';
import { InMemoryVehicleRepository } from './vehicle-repository';
import { InMemoryServiceRepository } from './service-repository';
import { InMemoryPartRepository } from './part-repository';
import { InMemoryWorkshopRepository } from './workshop-repository';
import { InMemoryWorkOrderRepository } from './work-order-repository';
import { InMemoryAdminUserRepository } from './admin-user-repository';
import type { StateSession } from './state';

export function inMemoryRepositoryContext(session: StateSession): RepositoryContext {
  return {
    customers: new InMemoryCustomerRepository(session), vehicles: new InMemoryVehicleRepository(session),
    services: new InMemoryServiceRepository(session), parts: new InMemoryPartRepository(session),
    workshops: new InMemoryWorkshopRepository(session), workOrders: new InMemoryWorkOrderRepository(session),
    users: new InMemoryAdminUserRepository(session), events: new InMemoryDomainEventStore(session)
  };
}
