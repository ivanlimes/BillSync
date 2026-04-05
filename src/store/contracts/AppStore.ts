import type { AppAction } from '@/store/mutations/actions';
import type { AppState } from '@/store/state';

export interface AppStore {
  getState(): AppState;
  dispatch(action: AppAction): void;
  subscribe(listener: () => void): () => void;
}
