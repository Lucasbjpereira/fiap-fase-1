import type { PartRepository } from '../../../domain/part/part-repository';
export class ListParts {
  constructor(private readonly repository: PartRepository) {}
  execute() { return this.repository.findAll(); }
}
