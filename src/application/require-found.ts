import { ApplicationError } from './errors';
export function requireFound<T>(value: T | undefined, label: string): T {
  if (value === undefined) throw new ApplicationError('not_found', `${label} não encontrado`);
  return value;
}
