import { randomBytes } from 'node:crypto';
import { isValidCpfCnpj, normalizeDocument } from '../customer/tax-document';
import { isValidPlate } from '../vehicle/vehicle-plate';
import { DomainError } from './domain-error';

export class TaxDocument {
  readonly value: string;
  constructor(input: string) {
    const value = normalizeDocument(input);
    if (!isValidCpfCnpj(value)) throw new DomainError('CPF/CNPJ inválido');
    this.value = value;
  }
}

export class VehiclePlate {
  readonly value: string;
  constructor(input: string) {
    if (!isValidPlate(input)) throw new DomainError('Placa inválida');
    this.value = input.toUpperCase().replace(/[^A-Z0-9]/g, '');
  }
}

export class Money {
  constructor(readonly cents: number) {
    if (!Number.isSafeInteger(cents) || cents < 0) throw new DomainError('Valor monetário inválido');
  }
  add(other: Money): Money { return new Money(this.cents + other.cents); }
  multiply(quantity: number): Money { return new Money(this.cents * new Quantity(quantity).value); }
}

export class Quantity {
  constructor(readonly value: number) {
    if (!Number.isSafeInteger(value) || value <= 0) throw new DomainError('Quantidade inválida');
  }
}

export class TrackingCode {
  static generate(): TrackingCode { return new TrackingCode(randomBytes(24).toString('base64url')); }
  constructor(readonly value: string) {
    if (!/^[A-Za-z0-9_-]{32}$/.test(value)) throw new DomainError('Código de acompanhamento inválido');
  }
}
