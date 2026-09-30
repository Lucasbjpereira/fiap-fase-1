import { Service } from '../../domain/service/service';
import type { ServiceRepository } from '../../domain/service/service-repository';
import { nextId, type StateSession } from './state';

export class InMemoryServiceRepository implements ServiceRepository {
  constructor(private readonly session: StateSession) {}
  async findById(id: number) { return this.session.state.services.get(id); }
  async findAll() { return [...this.session.state.services.values()].sort((a, b) => a.id! - b.id!); }
  async save(service: Service) {
    const state = this.session.state;
    const saved = new Service(service.id ?? nextId(state, 'service'), service.name, service.description, service.price, service.estimatedMinutes, service.active);
    state.services.set(saved.id!, saved);
    return saved;
  }
}
