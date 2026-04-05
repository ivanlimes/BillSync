import type { BillId, PaymentRecord } from '@/domain';
import type { AppState } from '@/store/state';

export function selectPaymentEntityState(state: AppState) {
  return state.entities.payments;
}

export function selectPayments(state: AppState): PaymentRecord[] {
  return state.entities.payments.allIds.map((paymentId) => state.entities.payments.byId[paymentId]);
}

export function selectPaymentsForBill(state: AppState, billId: BillId | null): PaymentRecord[] {
  if (billId === null) {
    return [];
  }

  return selectPayments(state).filter((payment) => payment.billId === billId);
}

export function selectPaymentById(state: AppState, paymentId: string | null) {
  if (paymentId === null) {
    return null;
  }

  return state.entities.payments.byId[paymentId] ?? null;
}

export function selectSelectedPayment(state: AppState) {
  return selectPaymentById(state, state.ui.editing.selectedPaymentId);
}
