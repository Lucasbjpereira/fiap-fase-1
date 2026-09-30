export class AdminUser {
  constructor(readonly id: number, readonly email: string, readonly passwordHash: string) {}
}
