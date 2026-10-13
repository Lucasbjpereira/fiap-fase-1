import type { DomainEventStore } from '../../application/domain-event-store';
import type { DomainEvent } from '../../domain/shared/domain-event';
import type { StateSession } from './state';

export class InMemoryDomainEventStore implements DomainEventStore {
  constructor(private readonly session: StateSession) {}
  async append(events: readonly DomainEvent[]): Promise<void> { this.session.state.events.push(...events); }
}
