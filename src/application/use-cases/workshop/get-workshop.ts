import type { WorkshopRepository } from '../../../domain/workshop/workshop-repository';
import { requireFound } from '../../require-found';
export class GetWorkshop {
  constructor(private readonly repository: WorkshopRepository) {}
  async execute(id: number) { return requireFound(await this.repository.findById(id), 'Oficina'); }
}
