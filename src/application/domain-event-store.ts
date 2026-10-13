import type { DomainEvent } from '../domain/shared/domain-event';

/** Porta transacional de registro; não implica broker, publicação ou Event Sourcing. */
export interface DomainEventStore {
  append(events: readonly DomainEvent[]): Promise<void>;
}
