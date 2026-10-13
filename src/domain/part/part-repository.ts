import type { Part } from './part';
import type { InventoryMovement } from './inventory-movement';
export interface PartRepository {
  findById(id: number, lock?: boolean): Promise<Part | undefined>;
  findAll(): Promise<Part[]>;
  save(part: Part): Promise<Part>;
  recordMovement(movement: InventoryMovement): Promise<void>;
  movements(id: number): Promise<InventoryMovement[]>;
}
