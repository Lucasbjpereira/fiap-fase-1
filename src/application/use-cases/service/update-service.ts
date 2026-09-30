import type { ServiceRepository } from '../../../domain/service/service-repository';
import { Money } from '../../../domain/shared/value-objects';
import { requireFound } from '../../require-found';
export class UpdateService {
  constructor(private readonly repository: ServiceRepository) {}
  async execute(id: number, input: { name?: string; description?: string; priceCents?: number; estimatedMinutes?: number; active?: boolean }) {
    const current = requireFound(await this.repository.findById(id), 'Serviço');
    let updated = current;
    if (input.name !== undefined) updated = updated.rename(input.name);
    if (input.description !== undefined) updated = updated.changeDescription(input.description);
    if (input.priceCents !== undefined) updated = updated.changePrice(new Money(input.priceCents));
    if (input.estimatedMinutes !== undefined) updated = updated.changeEstimatedMinutes(input.estimatedMinutes);
    if (input.active !== undefined) updated = input.active ? updated.activate() : updated.deactivate();
    return this.repository.save(updated);
  }
}
