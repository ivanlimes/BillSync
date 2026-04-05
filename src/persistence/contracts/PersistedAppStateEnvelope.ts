import type { AppState } from '@/store/state';

export interface PersistedAppStateEnvelope {
  schemaVersion: number;
  savedAt: string;
  state: AppState;
}
