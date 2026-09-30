import { Part } from '../../../domain/part/part';
import type { PartRepository } from '../../../domain/part/part-repository';
export class CreatePart {
  constructor(private readonly repository: PartRepository) {}
  execute(input: Parameters<typeof Part.create>[0]) { return this.repository.save(Part.create(input)); }
}
