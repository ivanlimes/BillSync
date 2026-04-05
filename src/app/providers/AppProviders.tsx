import type { PropsWithChildren } from 'react';
import { AppStoreProvider } from '@/store';
import { AppPersistenceBoundary, LocalStorageAppPersistenceAdapter } from '@/persistence';

const persistenceAdapter = new LocalStorageAppPersistenceAdapter();

export function AppProviders({ children }: PropsWithChildren) {
  return (
    <AppStoreProvider>
      <AppPersistenceBoundary adapter={persistenceAdapter}>{children}</AppPersistenceBoundary>
    </AppStoreProvider>
  );
}
