import type { PaymentRecord, PaymentType } from '@/domain';

export interface PaymentFormValues {
  amount: string;
  paymentDate: string;
  paymentType: PaymentType;
  notes: string;
}

export const defaultPaymentFormValues: PaymentFormValues = {
  amount: '',
  paymentDate: '',
  paymentType: 'manual',
  notes: '',
};

export function getPaymentFormValues(payment?: PaymentRecord | null): PaymentFormValues {
  if (!payment) {
    return defaultPaymentFormValues;
  }

  return {
    amount: String(payment.amount),
    paymentDate: payment.paymentDate,
    paymentType: payment.paymentType,
    notes: payment.notes ?? '',
  };
}

export function validatePaymentForm(values: PaymentFormValues) {
  const errors: Partial<Record<keyof PaymentFormValues, string>> = {};

  const amount = Number(values.amount);

  if (!Number.isFinite(amount) || amount <= 0) {
    errors.amount = 'Payment amount must be greater than 0.';
  }

  if (values.paymentDate.trim().length === 0) {
    errors.paymentDate = 'Payment date is required.';
  }

  return errors;
}
