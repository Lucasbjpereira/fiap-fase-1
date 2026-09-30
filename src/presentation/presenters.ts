import type { Customer } from '../domain/customer/customer';
import type { Vehicle } from '../domain/vehicle/vehicle';
import type { Service } from '../domain/service/service';
import type { Part } from '../domain/part/part';
import type { Workshop } from '../domain/workshop/workshop';
import type { InventoryMovement } from '../domain/part/inventory-movement';

export const customerView = (entity: Customer) => ({ id: entity.id, name: entity.name, document: entity.document.value, email: entity.email ?? null, phone: entity.phone ?? null });
export const vehicleView = (entity: Vehicle) => ({ id: entity.id, customerId: entity.customerId, plate: entity.plate.value, brand: entity.brand, model: entity.model, year: entity.year });
export const serviceView = (entity: Service) => ({ id: entity.id, name: entity.name, description: entity.description ?? null, priceCents: entity.price.cents, estimatedMinutes: entity.estimatedMinutes, active: entity.active });
export const partView = (entity: Part) => ({ id: entity.id, sku: entity.sku, name: entity.name, description: entity.description ?? null, priceCents: entity.price.cents, stockQuantity: entity.stockQuantity, minimumStock: entity.minimumStock, active: entity.active });
export const workshopView = (entity: Workshop) => ({ id: entity.id, name: entity.name, document: entity.document.value, address: entity.address, phone: entity.phone ?? null });
export const movementView = (entity: InventoryMovement) => ({ id: entity.id, part_id: entity.partId, work_order_id: entity.workOrderId ?? null, quantity_delta: entity.quantityDelta, reason: entity.reason, created_at: entity.createdAt });
