import { useRef, useSyncExternalStore } from 'react';
import { useAppStoreContext } from '@/store/context/AppStoreContext';
import type { AppState } from '@/store/state';

export function useAppStore<TSelected>(selector: (state: AppState) => TSelected): TSelected {
  const store = useAppStoreContext();
  const lastStateRef = useRef<AppState | null>(null);
  const lastSelectedRef = useRef<TSelected | undefined>(undefined);
  const hasSelectedRef = useRef(false);

  const getSelectedSnapshot = () => {
    const state = store.getState();

    if (lastStateRef.current === state && hasSelectedRef.current) {
      return lastSelectedRef.current as TSelected;
    }

    const selected = selector(state);
    lastStateRef.current = state;
    lastSelectedRef.current = selected;
    hasSelectedRef.current = true;

    return selected;
  };

  return useSyncExternalStore(store.subscribe, getSelectedSnapshot, getSelectedSnapshot);
}
