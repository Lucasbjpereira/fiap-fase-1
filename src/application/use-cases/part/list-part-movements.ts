import type { PartRepository } from '../../../domain/part/part-repository';
import { requireFound } from '../../require-found';
export class ListPartMovements {
  constructor(private readonly repository: PartRepository) {}
  async execute(id: number) {
    requireFound(await this.repository.findById(id), 'Peça');
    return this.repository.movements(id);
  }
}
