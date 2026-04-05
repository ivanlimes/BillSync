import type { BillFrequency } from '@/domain';

export function annualMultiplierForFrequency(frequency: BillFrequency) {
  switch (frequency) {
    case 'monthly':
      return 12;
    case 'quarterly':
      return 4;
    case 'semiannual':
      return 2;
    case 'annual':
      return 1;
    case 'custom':
    default:
      return 12;
  }
}

export function monthlyEquivalentForFrequency(frequency: BillFrequency) {
  switch (frequency) {
    case 'monthly':
      return 1;
    case 'quarterly':
      return 1 / 3;
    case 'semiannual':
      return 1 / 6;
    case 'annual':
      return 1 / 12;
    case 'custom':
    default:
      return 1;
  }
}
