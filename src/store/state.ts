import type { AppDestination } from '@/app/routing/destinations';
import type {
  AppPreferences,
  BillFilterKey,
  BillId,
  BillSortKey,
  ForecastSettings,
  PaymentRecord,
  RecurringBill,
} from '@/domain';

export interface EntityState<TModel, TId extends string = string> {
  byId: Record<TId, TModel>;
  allIds: TId[];
}

export interface AppEntities {
  bills: EntityState<RecurringBill, BillId>;
  payments: EntityState<PaymentRecord>;
}

export type EditorKind =
  | 'none'
  | 'bill-create'
  | 'bill-edit'
  | 'payment-create'
  | 'payment-edit'
  | 'forecast-edit';

export interface EditingState {
  kind: EditorKind;
  selectedPaymentId: string | null;
}


export interface BillsWorkspaceState {
  searchQuery: string;
  activeFilter: BillFilterKey;
  sortKey: BillSortKey;
}

export interface AppUiState {
  activeDestination: AppDestination;
  selectedBillId: BillId | null;
  editing: EditingState;
  billsWorkspace: BillsWorkspaceState;
}

export interface AppState {
  schemaVersion: number;
  entities: AppEntities;
  forecastSettings: ForecastSettings;
  preferences: AppPreferences;
  ui: AppUiState;
}
