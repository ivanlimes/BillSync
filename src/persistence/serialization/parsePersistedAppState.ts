import type { PersistedAppStateEnvelope } from '@/persistence/contracts/PersistedAppStateEnvelope';
import { APP_STATE_SCHEMA_VERSION } from '@/store';
import type { AppState } from '@/store/state';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isAppState(value: unknown): value is AppState {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.schemaVersion === 'number' &&
    isRecord(value.entities) &&
    isRecord(value.forecastSettings) &&
    isRecord(value.preferences) &&
    isRecord(value.ui)
  );
}

export function parsePersistedAppState(rawValue: string): PersistedAppStateEnvelope | null {
  try {
    const parsed: unknown = JSON.parse(rawValue);

    if (!isRecord(parsed)) {
      return null;
    }

    if (typeof parsed.schemaVersion !== 'number' || typeof parsed.savedAt !== 'string') {
      return null;
    }

    if (!isAppState(parsed.state)) {
      return null;
    }

    if (parsed.schemaVersion !== APP_STATE_SCHEMA_VERSION) {
      return null;
    }

    if (parsed.state.schemaVersion !== parsed.schemaVersion) {
      return null;
    }

    return {
      schemaVersion: parsed.schemaVersion,
      savedAt: parsed.savedAt,
      state: parsed.state,
    };
  } catch {
    return null;
  }
}
