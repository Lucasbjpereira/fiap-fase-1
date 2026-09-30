import { Workshop } from '../../../domain/workshop/workshop';
import type { WorkshopRepository } from '../../../domain/workshop/workshop-repository';
export class CreateWorkshop {
  constructor(private readonly repository: WorkshopRepository) {}
  execute(input: Parameters<typeof Workshop.create>[0]) { return this.repository.save(Workshop.create(input)); }
}
