import type { Part } from './part';
import type { InventoryMovement } from './inventory-movement';
export interface PartRepository {
  findById(id: number): Promise<Part | undefined>;
  findAll(): Promise<Part[]>;
  save(part: Part): Promise<Part>;
  adjustStock(id: number, delta: number): Promise<Part | undefined>;
  consume(id: number, quantity: number): Promise<boolean>;
  recordMovement(movement: InventoryMovement): Promise<void>;
  movements(id: number): Promise<InventoryMovement[]>;
}
