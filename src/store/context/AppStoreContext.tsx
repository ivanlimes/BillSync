import { createContext, useContext, useRef, type PropsWithChildren } from 'react';
import { createAppStore } from '@/store/store';
import type { AppStore } from '@/store/contracts/AppStore';
import type { AppState } from '@/store/state';

const AppStoreContext = createContext<AppStore | null>(null);

interface AppStoreProviderProps extends PropsWithChildren {
  initialState?: AppState;
}

export function AppStoreProvider({ children, initialState }: AppStoreProviderProps) {
  const storeRef = useRef<AppStore | null>(null);

  if (storeRef.current === null) {
    storeRef.current = createAppStore(initialState);
  }

  return <AppStoreContext.Provider value={storeRef.current}>{children}</AppStoreContext.Provider>;
}

export function useAppStoreContext() {
  const store = useContext(AppStoreContext);

  if (store === null) {
    throw new Error('AppStoreProvider is missing from the component tree.');
  }

  return store;
}
