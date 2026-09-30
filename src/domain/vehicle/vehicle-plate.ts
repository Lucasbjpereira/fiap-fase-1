export function isValidPlate(value: string): boolean {
  const plate = value.toUpperCase().replace(/[^A-Z0-9]/g, '');
  return /^[A-Z]{3}\d[A-Z0-9]\d{2}$/.test(plate);
}
