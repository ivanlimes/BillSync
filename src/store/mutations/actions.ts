import type {
  AppPreferences,
  BillFilterKey,
  BillId,
  BillSortKey,
  ForecastSettings,
  PaymentRecord,
  RecurringBill,
} from '@/domain';
import type { AppState } from '@/store/state';

export type AppAction =
  | { type: 'state/replace'; payload: AppState }
  | { type: 'bills/add'; payload: RecurringBill }
  | { type: 'bills/update'; payload: { id: BillId; patch: Partial<Omit<RecurringBill, 'id'>> } }
  | { type: 'bills/archive'; payload: { id: BillId } }
  | { type: 'payments/add'; payload: PaymentRecord }
  | { type: 'payments/update'; payload: { id: string; patch: Partial<Omit<PaymentRecord, 'id'>> } }
  | { type: 'payments/remove'; payload: { id: string } }
  | { type: 'forecast/update'; payload: Partial<ForecastSettings> }
  | { type: 'preferences/update'; payload: Partial<AppPreferences> }
  | { type: 'ui/set-active-destination'; payload: AppState['ui']['activeDestination'] }
  | { type: 'ui/select-bill'; payload: BillId | null }
  | { type: 'ui/select-payment'; payload: string | null }
  | { type: 'ui/set-bills-search-query'; payload: string }
  | { type: 'ui/set-bills-filter'; payload: BillFilterKey }
  | { type: 'ui/set-bills-sort'; payload: BillSortKey }
  | { type: 'ui/open-bill-workspace'; payload: { billId: BillId; editor?: 'bill-edit' | 'payment-create' } }
  | { type: 'ui/open-payment-editor'; payload: { billId: BillId; paymentId: string } }
  | { type: 'editor/open'; payload: AppState['ui']['editing']['kind'] }
  | { type: 'editor/close' };

export const appActions = {
  replaceState(payload: AppState): AppAction {
    return { type: 'state/replace', payload };
  },
  addBill(payload: RecurringBill): AppAction {
    return { type: 'bills/add', payload };
  },
  updateBill(id: BillId, patch: Partial<Omit<RecurringBill, 'id'>>): AppAction {
    return { type: 'bills/update', payload: { id, patch } };
  },
  archiveBill(id: BillId): AppAction {
    return { type: 'bills/archive', payload: { id } };
  },
  addPayment(payload: PaymentRecord): AppAction {
    return { type: 'payments/add', payload };
  },
  updatePayment(id: string, patch: Partial<Omit<PaymentRecord, 'id'>>): AppAction {
    return { type: 'payments/update', payload: { id, patch } };
  },
  removePayment(id: string): AppAction {
    return { type: 'payments/remove', payload: { id } };
  },
  updateForecastSettings(payload: Partial<ForecastSettings>): AppAction {
    return { type: 'forecast/update', payload };
  },
  updatePreferences(payload: Partial<AppPreferences>): AppAction {
    return { type: 'preferences/update', payload };
  },
  setActiveDestination(payload: AppState['ui']['activeDestination']): AppAction {
    return { type: 'ui/set-active-destination', payload };
  },
  selectBill(payload: BillId | null): AppAction {
    return { type: 'ui/select-bill', payload };
  },
  selectPayment(payload: string | null): AppAction {
    return { type: 'ui/select-payment', payload };
  },
  setBillsSearchQuery(payload: string): AppAction {
    return { type: 'ui/set-bills-search-query', payload };
  },
  setBillsFilter(payload: BillFilterKey): AppAction {
    return { type: 'ui/set-bills-filter', payload };
  },
  setBillsSort(payload: BillSortKey): AppAction {
    return { type: 'ui/set-bills-sort', payload };
  },
  openBillWorkspace(payload: { billId: BillId; editor?: 'bill-edit' | 'payment-create' }): AppAction {
    return { type: 'ui/open-bill-workspace', payload };
  },
  openPaymentEditor(payload: { billId: BillId; paymentId: string }): AppAction {
    return { type: 'ui/open-payment-editor', payload };
  },
  openEditor(payload: AppState['ui']['editing']['kind']): AppAction {
    return { type: 'editor/open', payload };
  },
  closeEditor(): AppAction {
    return { type: 'editor/close' };
  },
} as const;
