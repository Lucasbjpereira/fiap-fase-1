import { ApplicationError } from '../../application/errors';
import { InventoryMovement } from '../../domain/part/inventory-movement';
import { Part } from '../../domain/part/part';
import type { PartRepository } from '../../domain/part/part-repository';
import { nextId, type StateSession } from './state';

export class InMemoryPartRepository implements PartRepository {
  constructor(private readonly session: StateSession) {}
  async findById(id: number) { return this.session.state.parts.get(id); }
  async findAll() { return [...this.session.state.parts.values()].sort((a, b) => a.id! - b.id!); }
  async save(part: Part) {
    const state = this.session.state;
    if ([...state.parts.values()].some(existing => existing.id !== part.id && existing.sku === part.sku)) {
      throw new ApplicationError('conflict', 'Peça com este SKU já existe');
    }
    const saved = new Part(part.id ?? nextId(state, 'part'), part.sku, part.name, part.description, part.price, part.stockQuantity, part.minimumStock, part.active);
    state.parts.set(saved.id!, saved);
    return saved;
  }
  async adjustStock(id: number, delta: number) {
    const current = this.session.state.parts.get(id);
    if (!current || current.stockQuantity + delta < 0) return undefined;
    const updated = delta > 0 ? current.receiveStock(delta) : current.withdrawStock(-delta);
    this.session.state.parts.set(id, updated);
    return updated;
  }
  async consume(id: number, quantity: number) {
    const current = this.session.state.parts.get(id);
    if (!current?.active || current.stockQuantity < quantity) return false;
    this.session.state.parts.set(id, current.withdrawStock(quantity));
    return true;
  }
  async recordMovement(movement: InventoryMovement) {
    const state = this.session.state;
    if (!state.parts.has(movement.partId)) throw new ApplicationError('conflict', 'Peça não encontrada');
    const saved = new InventoryMovement(nextId(state, 'movement'), movement.partId, movement.quantityDelta, movement.reason, movement.workOrderId, new Date());
    state.movements.push(saved);
  }
  async movements(id: number) { return this.session.state.movements.filter(movement => movement.partId === id).sort((a, b) => b.id! - a.id!); }
}
