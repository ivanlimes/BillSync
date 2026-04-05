import type { AppPersistenceAdapter } from '@/persistence/contracts/AppPersistenceAdapter';
import type { PersistedAppStateEnvelope } from '@/persistence/contracts/PersistedAppStateEnvelope';
import { getLocalStorage } from '@/persistence/local/getLocalStorage';
import { STORAGE_KEYS } from '@/persistence/local/storageKeys';
import { parsePersistedAppState } from '@/persistence/serialization/parsePersistedAppState';
import { APP_STATE_SCHEMA_VERSION } from '@/store';
import type { AppState } from '@/store/state';

export class LocalStorageAppPersistenceAdapter implements AppPersistenceAdapter {
  async load(): Promise<AppState | null> {
    const storage = getLocalStorage();

    if (storage === null) {
      return null;
    }

    const storedVersion = storage.getItem(STORAGE_KEYS.schemaVersion);

    if (storedVersion !== null && Number(storedVersion) !== APP_STATE_SCHEMA_VERSION) {
      return null;
    }

    const rawState = storage.getItem(STORAGE_KEYS.appState);

    if (rawState === null) {
      return null;
    }

    const envelope = parsePersistedAppState(rawState);

    if (envelope === null) {
      await this.clear();
      return null;
    }

    return envelope.state;
  }

  async save(state: AppState): Promise<void> {
    const storage = getLocalStorage();

    if (storage === null) {
      return;
    }

    const envelope: PersistedAppStateEnvelope = {
      schemaVersion: APP_STATE_SCHEMA_VERSION,
      savedAt: new Date().toISOString(),
      state,
    };

    storage.setItem(STORAGE_KEYS.schemaVersion, String(APP_STATE_SCHEMA_VERSION));
    storage.setItem(STORAGE_KEYS.appState, JSON.stringify(envelope));
  }

  async clear(): Promise<void> {
    const storage = getLocalStorage();

    if (storage === null) {
      return;
    }

    storage.removeItem(STORAGE_KEYS.schemaVersion);
    storage.removeItem(STORAGE_KEYS.appState);
  }
}
