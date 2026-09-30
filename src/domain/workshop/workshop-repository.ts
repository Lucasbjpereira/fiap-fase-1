import type { Workshop } from './workshop';
export interface WorkshopRepository {
  findById(id: number): Promise<Workshop | undefined>;
  save(workshop: Workshop): Promise<Workshop>;
}
