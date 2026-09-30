export class DomainError extends Error {
  constructor(message: string, readonly kind: 'validation' | 'conflict' = 'validation') { super(message); }
}
