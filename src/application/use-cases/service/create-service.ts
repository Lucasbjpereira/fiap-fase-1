import { Service } from '../../../domain/service/service';
import type { ServiceRepository } from '../../../domain/service/service-repository';
export class CreateService {
  constructor(private readonly repository: ServiceRepository) {}
  execute(input: Parameters<typeof Service.create>[0]) { return this.repository.save(Service.create(input)); }
}
