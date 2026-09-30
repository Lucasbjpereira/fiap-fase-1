import type { Customer } from '../../domain/customer/customer';
import type { Vehicle } from '../../domain/vehicle/vehicle';
import type { Service } from '../../domain/service/service';
import type { Part } from '../../domain/part/part';
import type { Workshop } from '../../domain/workshop/workshop';
import type { AdminUser } from '../../domain/identity/admin-user';
import type { WorkOrder } from '../../domain/work-order/work-order';
import type { InventoryMovement } from '../../domain/part/inventory-movement';

export interface StoredWorkOrder {
  order: WorkOrder;
  quoteTotalCents: number;
  openedAt: Date;
  updatedAt: Date;
  startedAt?: Date;
  finishedAt?: Date;
  deliveredAt?: Date;
}

export interface MemoryState {
  customers: Map<number, Customer>;
  vehicles: Map<number, Vehicle>;
  services: Map<number, Service>;
  parts: Map<number, Part>;
  workshops: Map<number, Workshop>;
  users: Map<number, AdminUser>;
  workOrders: Map<number, StoredWorkOrder>;
  movements: InventoryMovement[];
  nextIds: { customer: number; vehicle: number; service: number; part: number; workshop: number; workOrder: number; workOrderItem: number; movement: number };
}

function emptyState(): MemoryState {
  return {
    customers: new Map(), vehicles: new Map(), services: new Map(), parts: new Map(),
    workshops: new Map(), users: new Map(), workOrders: new Map(), movements: [],
    nextIds: { customer: 1, vehicle: 1, service: 1, part: 1, workshop: 1, workOrder: 1, workOrderItem: 1, movement: 1 }
  };
}

export function copyState(state: MemoryState): MemoryState {
  return {
    customers: new Map(state.customers), vehicles: new Map(state.vehicles), services: new Map(state.services),
    parts: new Map(state.parts), workshops: new Map(state.workshops), users: new Map(state.users),
    workOrders: new Map(state.workOrders), movements: [...state.movements], nextIds: { ...state.nextIds }
  };
}

export class InMemoryStore {
  state: MemoryState = emptyState();

  addAdminUser(user: AdminUser): void {
    this.state.users.set(user.id, user);
  }
}

export interface StateSession { readonly state: MemoryState }

export class LiveSession implements StateSession {
  constructor(private readonly store: InMemoryStore) {}
  get state(): MemoryState { return this.store.state; }
}

export class SnapshotSession implements StateSession {
  constructor(readonly state: MemoryState) {}
}

export function nextId(state: MemoryState, kind: keyof MemoryState['nextIds']): number {
  return state.nextIds[kind]++;
}
