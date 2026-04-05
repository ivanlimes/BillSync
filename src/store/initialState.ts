import type { AppState } from '@/store/state';
import { createEmptyEntityState } from '@/store/utils/entityState';

export const APP_STATE_SCHEMA_VERSION = 1;

export const initialAppState: AppState = {
  schemaVersion: APP_STATE_SCHEMA_VERSION,
  entities: {
    bills: createEmptyEntityState(),
    payments: createEmptyEntityState(),
  },
  forecastSettings: {
    includeVariableEstimates: true,
    forecastHorizonMonths: 3,
  },
  preferences: {
    themeMode: 'system',
    accentPreference: 'dusty-plum',
    backgroundPreference: 'default',
    defaultSort: 'nextDueDate',
    defaultFilter: 'all',
    densityMode: 'comfortable',
  },
  ui: {
    activeDestination: 'dashboard',
    selectedBillId: null,
    editing: {
      kind: 'none',
      selectedPaymentId: null,
    },
    billsWorkspace: {
      searchQuery: '',
      activeFilter: 'all',
      sortKey: 'nextDueDate',
    },
  },
};
