export type ErrorKind = 'not_found' | 'validation' | 'conflict' | 'unauthorized';

export class ApplicationError extends Error {
  constructor(readonly kind: ErrorKind, message: string) {
    super(message);
    this.name = 'ApplicationError';
  }
}
