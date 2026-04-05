import type { AppState } from '@/store/state';

export interface AppPersistenceAdapter {
  load(): Promise<AppState | null>;
  save(state: AppState): Promise<void>;
  clear(): Promise<void>;
}
