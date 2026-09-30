import type { PartRepository } from '../../../domain/part/part-repository';
import { requireFound } from '../../require-found';
export class DeactivatePart {
  constructor(private readonly repository: PartRepository) {}
  async execute(id: number) {
    const current = requireFound(await this.repository.findById(id), 'Peça');
    await this.repository.save(current.deactivate());
    return { deactivated: true };
  }
}
