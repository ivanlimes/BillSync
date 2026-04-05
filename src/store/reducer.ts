import type { AppAction } from '@/store/mutations/actions';
import type { AppState } from '@/store/state';
import { patchEntity, removeEntity, upsertEntity } from '@/store/utils/entityState';

function sanitizeUiState(state: AppState): AppState['ui'] {
  const selectedBillExists =
    state.ui.selectedBillId !== null && state.entities.bills.byId[state.ui.selectedBillId] !== undefined;
  const selectedPaymentExists =
    state.ui.editing.selectedPaymentId !== null &&
    state.entities.payments.byId[state.ui.editing.selectedPaymentId] !== undefined;

  const nextSelectedBillId = selectedBillExists ? state.ui.selectedBillId : null;
  const nextSelectedPaymentId = selectedPaymentExists ? state.ui.editing.selectedPaymentId : null;

  const nextEditingKind =
    state.ui.editing.kind === 'bill-edit' && nextSelectedBillId === null
      ? 'none'
      : state.ui.editing.kind === 'payment-create' && nextSelectedBillId === null
        ? 'none'
        : state.ui.editing.kind === 'payment-edit' && (nextSelectedBillId === null || nextSelectedPaymentId === null)
          ? 'none'
          : state.ui.editing.kind;

  return {
    ...state.ui,
    selectedBillId: nextSelectedBillId,
    editing: {
      kind: nextEditingKind,
      selectedPaymentId: nextEditingKind === 'payment-edit' ? nextSelectedPaymentId : null,
    },
  };
}

function getEditingStateForSelectionChange(
  currentEditing: AppState['ui']['editing'],
  nextBillId: AppState['ui']['selectedBillId'],
): AppState['ui']['editing'] {
  if (currentEditing.kind === 'bill-edit' || currentEditing.kind === 'payment-create' || currentEditing.kind === 'payment-edit') {
    return { kind: 'none', selectedPaymentId: null };
  }

  if (currentEditing.kind === 'none' && nextBillId === null) {
    return { kind: 'none', selectedPaymentId: null };
  }

  return {
    ...currentEditing,
    selectedPaymentId: null,
  };
}

function syncBillsWorkspaceWithPreferences(state: AppState, action: Extract<AppAction, { type: 'preferences/update' }>) {
  const nextBillsWorkspace = { ...state.ui.billsWorkspace };

  if (action.payload.defaultFilter) {
    nextBillsWorkspace.activeFilter = action.payload.defaultFilter;
  }

  if (action.payload.defaultSort) {
    nextBillsWorkspace.sortKey = action.payload.defaultSort;
  }

  return nextBillsWorkspace;
}

function getEditingStateForDestination(
  destination: AppState['ui']['activeDestination'],
  currentEditing: AppState['ui']['editing'],
): AppState['ui']['editing'] {
  if (destination === 'bills') {
    if (currentEditing.kind === 'forecast-edit') {
      return { kind: 'none', selectedPaymentId: null };
    }

    return currentEditing;
  }

  if (destination === 'forecast') {
    if (currentEditing.kind === 'forecast-edit' || currentEditing.kind === 'none') {
      return currentEditing;
    }

    return { kind: 'none', selectedPaymentId: null };
  }

  return { kind: 'none', selectedPaymentId: null };
}

export function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'state/replace': {
      const nextState: AppState = {
        ...action.payload,
        ui: {
          ...action.payload.ui,
          billsWorkspace: action.payload.ui.billsWorkspace ?? {
            searchQuery: '',
            activeFilter: action.payload.preferences.defaultFilter,
            sortKey: action.payload.preferences.defaultSort,
          },
        },
      };

      return {
        ...nextState,
        ui: sanitizeUiState(nextState),
      };
    }

    case 'bills/add':
      return {
        ...state,
        entities: {
          ...state.entities,
          bills: upsertEntity(state.entities.bills, action.payload),
        },
      };

    case 'bills/update':
      return {
        ...state,
        entities: {
          ...state.entities,
          bills: patchEntity(state.entities.bills, action.payload.id, action.payload.patch),
        },
      };

    case 'bills/archive': {
      const nextState: AppState = {
        ...state,
        entities: {
          ...state.entities,
          bills: patchEntity(state.entities.bills, action.payload.id, { state: 'archived' }),
        },
        ui: {
          ...state.ui,
          selectedBillId:
            state.ui.selectedBillId === action.payload.id ? null : state.ui.selectedBillId,
          editing:
            state.ui.selectedBillId === action.payload.id
              ? { kind: 'none', selectedPaymentId: null }
              : state.ui.editing,
        },
      };

      return {
        ...nextState,
        ui: sanitizeUiState(nextState),
      };
    }

    case 'payments/add':
      return {
        ...state,
        entities: {
          ...state.entities,
          payments: upsertEntity(state.entities.payments, action.payload),
        },
      };

    case 'payments/update':
      return {
        ...state,
        entities: {
          ...state.entities,
          payments: patchEntity(state.entities.payments, action.payload.id, action.payload.patch),
        },
      };

    case 'payments/remove': {
      const nextState: AppState = {
        ...state,
        entities: {
          ...state.entities,
          payments: removeEntity(state.entities.payments, action.payload.id),
        },
        ui: {
          ...state.ui,
          editing:
            state.ui.editing.selectedPaymentId === action.payload.id
              ? { kind: 'none', selectedPaymentId: null }
              : state.ui.editing,
        },
      };

      return {
        ...nextState,
        ui: sanitizeUiState(nextState),
      };
    }

    case 'forecast/update':
      return {
        ...state,
        forecastSettings: {
          ...state.forecastSettings,
          ...action.payload,
        },
      };

    case 'preferences/update':
      return {
        ...state,
        preferences: {
          ...state.preferences,
          ...action.payload,
        },
        ui: {
          ...state.ui,
          billsWorkspace: syncBillsWorkspaceWithPreferences(state, action),
        },
      };

    case 'ui/set-active-destination':
      return {
        ...state,
        ui: {
          ...state.ui,
          activeDestination: action.payload,
          editing: getEditingStateForDestination(action.payload, state.ui.editing),
        },
      };

    case 'ui/select-bill':
      return {
        ...state,
        ui: {
          ...state.ui,
          selectedBillId: action.payload,
          editing: getEditingStateForSelectionChange(state.ui.editing, action.payload),
        },
      };

    case 'ui/select-payment':
      return {
        ...state,
        ui: {
          ...state.ui,
          editing: {
            ...state.ui.editing,
            selectedPaymentId: action.payload,
          },
        },
      };

    case 'ui/set-bills-search-query':
      return {
        ...state,
        ui: {
          ...state.ui,
          billsWorkspace: {
            ...state.ui.billsWorkspace,
            searchQuery: action.payload,
          },
        },
      };

    case 'ui/set-bills-filter':
      return {
        ...state,
        ui: {
          ...state.ui,
          billsWorkspace: {
            ...state.ui.billsWorkspace,
            activeFilter: action.payload,
          },
        },
      };

    case 'ui/set-bills-sort':
      return {
        ...state,
        ui: {
          ...state.ui,
          billsWorkspace: {
            ...state.ui.billsWorkspace,
            sortKey: action.payload,
          },
        },
      };

    case 'ui/open-bill-workspace':
      return {
        ...state,
        ui: {
          ...state.ui,
          activeDestination: 'bills',
          selectedBillId: action.payload.billId,
          editing: {
            kind: action.payload.editor ?? 'none',
            selectedPaymentId: null,
          },
        },
      };

    case 'ui/open-payment-editor':
      return {
        ...state,
        ui: {
          ...state.ui,
          activeDestination: 'bills',
          selectedBillId: action.payload.billId,
          editing: {
            kind: 'payment-edit',
            selectedPaymentId: action.payload.paymentId,
          },
        },
      };

    case 'editor/open':
      return {
        ...state,
        ui: {
          ...state.ui,
          editing: {
            ...state.ui.editing,
            kind: action.payload,
            selectedPaymentId:
              action.payload === 'payment-edit' ? state.ui.editing.selectedPaymentId : null,
          },
        },
      };

    case 'editor/close':
      return {
        ...state,
        ui: {
          ...state.ui,
          editing: {
            kind: 'none',
            selectedPaymentId: null,
          },
        },
      };

    default:
      return state;
  }
}
