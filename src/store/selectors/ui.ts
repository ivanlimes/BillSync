import type { AppState } from '@/store/state';

export function selectUiState(state: AppState) {
  return state.ui;
}

export function selectActiveDestination(state: AppState) {
  return state.ui.activeDestination;
}

export function selectSelectedBillId(state: AppState) {
  return state.ui.selectedBillId;
}

export function selectEditingState(state: AppState) {
  return state.ui.editing;
}

export function selectSelectedPaymentId(state: AppState) {
  return state.ui.editing.selectedPaymentId;
}

export function selectBillsWorkspaceState(state: AppState) {
  return state.ui.billsWorkspace;
}
