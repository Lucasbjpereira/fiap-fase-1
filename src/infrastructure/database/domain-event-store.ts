import type { DomainEventStore } from '../../application/domain-event-store';
import type { DomainEvent } from '../../domain/shared/domain-event';
import { PostgresDao } from './postgres-dao';

export class PgDomainEventStore extends PostgresDao implements DomainEventStore {
  async append(events: readonly DomainEvent[]): Promise<void> {
    for (const event of events) {
      await this.rows('INSERT INTO domain_events (id, name, aggregate_type, aggregate_id, occurred_at, payload) VALUES ($1,$2,$3,$4,$5,$6::jsonb)',
        [event.id, event.name, event.aggregateType, event.aggregateId, event.occurredAt, JSON.stringify(event.payload)]);
    }
  }
}
