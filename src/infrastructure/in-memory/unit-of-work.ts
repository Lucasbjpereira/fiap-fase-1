import type { RepositoryContext, UnitOfWork } from '../../application/unit-of-work';
import { inMemoryRepositoryContext } from './repository-context';
import { copyState, InMemoryStore, SnapshotSession } from './state';

export class InMemoryUnitOfWork implements UnitOfWork {
  private previous: Promise<void> = Promise.resolve();
  constructor(private readonly store: InMemoryStore) {}

  async run<T>(operation: (context: RepositoryContext) => Promise<T>): Promise<T> {
    let release!: () => void;
    const current = new Promise<void>(resolve => { release = resolve; });
    const previous = this.previous;
    this.previous = current;
    await previous;
    try {
      const snapshot = copyState(this.store.state);
      const result = await operation(inMemoryRepositoryContext(new SnapshotSession(snapshot)));
      this.store.state = snapshot;
      return result;
    } finally {
      release();
    }
  }
}
