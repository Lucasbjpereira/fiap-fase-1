import type { ServiceRepository } from '../../../domain/service/service-repository';
import { requireFound } from '../../require-found';
export class GetService {
  constructor(private readonly repository: ServiceRepository) {}
  async execute(id: number) { return requireFound(await this.repository.findById(id), 'Serviço'); }
}
