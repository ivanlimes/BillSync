import type { BillClassification, BillFrequency, BillPriority, RecurringBill } from '@/domain';

export interface BillFormValues {
  name: string;
  category: string;
  expectedAmount: string;
  frequency: BillFrequency;
  nextDueDate: string;
  autopayEnabled: boolean;
  classification: BillClassification;
  priority: BillPriority;
  notes: string;
}

export const defaultBillFormValues: BillFormValues = {
  name: '',
  category: '',
  expectedAmount: '',
  frequency: 'monthly',
  nextDueDate: '',
  autopayEnabled: false,
  classification: 'fixed',
  priority: 'essential',
  notes: '',
};

export function getBillFormValues(bill?: RecurringBill | null): BillFormValues {
  if (!bill) {
    return defaultBillFormValues;
  }

  return {
    name: bill.name,
    category: bill.category,
    expectedAmount: String(bill.expectedAmount),
    frequency: bill.frequency,
    nextDueDate: bill.nextDueDate,
    autopayEnabled: bill.autopayEnabled,
    classification: bill.classification,
    priority: bill.priority,
    notes: bill.notes ?? '',
  };
}

export function validateBillForm(values: BillFormValues) {
  const errors: Partial<Record<keyof BillFormValues, string>> = {};

  if (values.name.trim().length === 0) {
    errors.name = 'Bill name is required.';
  }

  if (values.category.trim().length === 0) {
    errors.category = 'Category is required.';
  }

  const amount = Number(values.expectedAmount);

  if (!Number.isFinite(amount) || amount < 0) {
    errors.expectedAmount = 'Expected amount must be 0 or greater.';
  }

  if (values.nextDueDate.trim().length === 0) {
    errors.nextDueDate = 'Next due date is required.';
  }

  return errors;
}
