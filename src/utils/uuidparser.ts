export const parseUuidFormat = (input: string): number[] | null => {
  if (!input.toLowerCase().startsWith('uuid')) {
    return [4, 4, 4, 4];
  }
  const parts = input.slice(5).split('-');
  const numbers = parts.map((part) => parseInt(part, 10));
  if (numbers.some((n) => isNaN(n))) {
    return [4, 4, 4, 4];
  }

  return numbers;
};