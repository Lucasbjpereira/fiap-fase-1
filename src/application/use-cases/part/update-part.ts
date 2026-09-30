import type { PartRepository } from '../../../domain/part/part-repository';
import { Money } from '../../../domain/shared/value-objects';
import { requireFound } from '../../require-found';
export class UpdatePart {
  constructor(private readonly repository: PartRepository) {}
  async execute(id: number, input: { name?: string; description?: string; priceCents?: number; minimumStock?: number; active?: boolean }) {
    const current = requireFound(await this.repository.findById(id), 'Peça');
    let updated = current;
    if (input.name !== undefined) updated = updated.rename(input.name);
    if (input.description !== undefined) updated = updated.changeDescription(input.description);
    if (input.priceCents !== undefined) updated = updated.changePrice(new Money(input.priceCents));
    if (input.minimumStock !== undefined) updated = updated.changeMinimumStock(input.minimumStock);
    if (input.active !== undefined) updated = input.active ? updated.activate() : updated.deactivate();
    return this.repository.save(updated);
  }
}
