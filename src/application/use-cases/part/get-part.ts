import type { PartRepository } from '../../../domain/part/part-repository';
import { requireFound } from '../../require-found';
export class GetPart {
  constructor(private readonly repository: PartRepository) {}
  async execute(id: number) { return requireFound(await this.repository.findById(id), 'Peça'); }
}
