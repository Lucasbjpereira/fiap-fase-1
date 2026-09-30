export function normalizeDocument(value: string): string {
  return value.replace(/\D/g, '');
}

export function isValidCpfCnpj(value: string): boolean {
  const digits = normalizeDocument(value);
  if (digits.length === 11) {
    if (/^(\d)\1{10}$/.test(digits)) return false;
    const calc = (length: number) => {
      const sum = digits.slice(0, length).split('').reduce((acc, digit, index) => acc + Number(digit) * (length + 1 - index), 0);
      const rest = (sum * 10) % 11;
      return rest === 10 ? 0 : rest;
    };
    return calc(9) === Number(digits[9]) && calc(10) === Number(digits[10]);
  }
  if (digits.length === 14) {
    if (/^(\d)\1{13}$/.test(digits)) return false;
    const digit = (base: string, weights: number[]) => {
      const remainder = base.split('').reduce((sum, char, i) => sum + Number(char) * weights[i], 0) % 11;
      return remainder < 2 ? 0 : 11 - remainder;
    };
    const first = digit(digits.slice(0, 12), [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);
    const second = digit(digits.slice(0, 12) + first, [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);
    return first === Number(digits[12]) && second === Number(digits[13]);
  }
  return false;
}

