import type { AdminUser } from './admin-user';
export interface AdminUserRepository { findByEmail(email: string): Promise<AdminUser | undefined> }
