import type { AdminUserRepository } from '../../domain/identity/admin-user-repository';
import { type StateSession } from './state';

export class InMemoryAdminUserRepository implements AdminUserRepository {
  constructor(private readonly session: StateSession) {}
  async findByEmail(email: string) { return [...this.session.state.users.values()].find(user => user.email === email); }
}
