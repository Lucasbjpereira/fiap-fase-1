import { InMemoryWorkOrderQueries } from './work-order-queries';
import { InMemoryStore, LiveSession } from './state';
import { InMemoryUnitOfWork } from './unit-of-work';
import { inMemoryRepositoryContext } from './repository-context';

export function createInMemoryEnvironment() {
  const store = new InMemoryStore();
  const session = new LiveSession(store);
  return {
    store,
    repositories: inMemoryRepositoryContext(session),
    unitOfWork: new InMemoryUnitOfWork(store),
    workOrderQueries: new InMemoryWorkOrderQueries(session)
  };
}
