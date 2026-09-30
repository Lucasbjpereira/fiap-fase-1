import type { ServiceRepository } from '../../../domain/service/service-repository';
export class ListServices {
  constructor(private readonly repository: ServiceRepository) {}
  execute() { return this.repository.findAll(); }
}
