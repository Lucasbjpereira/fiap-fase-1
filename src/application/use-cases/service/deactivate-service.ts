import type { ServiceRepository } from '../../../domain/service/service-repository';
import { requireFound } from '../../require-found';
export class DeactivateService {
  constructor(private readonly repository: ServiceRepository) {}
  async execute(id: number) {
    const current = requireFound(await this.repository.findById(id), 'Serviço');
    await this.repository.save(current.deactivate());
    return { deactivated: true };
  }
}
