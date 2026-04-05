import type { BillId, RecurringBill } from '@/domain';
import type { AppState } from '@/store/state';

export function selectBillEntityState(state: AppState) {
  return state.entities.bills;
}

export function selectBills(state: AppState): RecurringBill[] {
  return state.entities.bills.allIds.map((billId) => state.entities.bills.byId[billId]);
}

export function selectBillById(state: AppState, billId: BillId | null) {
  if (billId === null) {
    return null;
  }

  return state.entities.bills.byId[billId] ?? null;
}

export function selectSelectedBill(state: AppState) {
  return selectBillById(state, state.ui.selectedBillId);
}
