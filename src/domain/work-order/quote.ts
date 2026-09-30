export function quoteTotalCents(items: Array<{ quantity: number; unitPriceCents: number }>): number {
  if (items.some(item => !Number.isInteger(item.quantity) || item.quantity <= 0 || item.unitPriceCents < 0)) {
    throw new Error('Quantidade ou preço inválido');
  }
  return items.reduce((total, item) => total + item.quantity * item.unitPriceCents, 0);
}

