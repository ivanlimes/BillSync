import { useEffect, useMemo, useRef, useState, type PropsWithChildren } from 'react';
import { appActions, useAppStoreContext } from '@/store';
import type { AppPersistenceAdapter } from '@/persistence/contracts/AppPersistenceAdapter';
import {
  AppPersistenceContext,
  defaultPersistenceStatus,
  type AppPersistenceStatus,
} from '@/persistence/react/AppPersistenceContext';

interface AppPersistenceBoundaryProps extends PropsWithChildren {
  adapter: AppPersistenceAdapter;
}

export function AppPersistenceBoundary({ adapter, children }: AppPersistenceBoundaryProps) {
  const store = useAppStoreContext();
  const [status, setStatus] = useState<AppPersistenceStatus>(defaultPersistenceStatus);
  const hasHydratedRef = useRef(false);

  useEffect(() => {
    let isCancelled = false;

    async function hydrate() {
      try {
        const persistedState = await adapter.load();

        if (isCancelled) {
          return;
        }

        if (persistedState !== null) {
          store.dispatch(appActions.replaceState(persistedState));
        }

        hasHydratedRef.current = true;
        setStatus({
          isHydrated: true,
          lastSavedAt: null,
          error: null,
        });
      } catch (error) {
        if (isCancelled) {
          return;
        }

        hasHydratedRef.current = true;
        setStatus({
          isHydrated: true,
          lastSavedAt: null,
          error: error instanceof Error ? error.message : 'Local persistence hydration failed.',
        });
      }
    }

    void hydrate();

    return () => {
      isCancelled = true;
    };
  }, [adapter, store]);

  useEffect(() => {
    if (!status.isHydrated) {
      return undefined;
    }

    return store.subscribe(() => {
      if (!hasHydratedRef.current) {
        return;
      }

      void adapter.save(store.getState()).then(
        () => {
          setStatus((currentStatus) => ({
            ...currentStatus,
            lastSavedAt: new Date().toISOString(),
            error: null,
          }));
        },
        (error: unknown) => {
          setStatus((currentStatus) => ({
            ...currentStatus,
            error: error instanceof Error ? error.message : 'Local persistence save failed.',
          }));
        },
      );
    });
  }, [adapter, status.isHydrated, store]);

  const contextValue = useMemo(() => status, [status]);

  if (!status.isHydrated) {
    return (
      <AppPersistenceContext.Provider value={contextValue}>
        <main>
          <h1>Family Monthly Bills — Local Persistence Hydration</h1>
          <p>Loading local-first state before the rest of the app mounts.</p>
        </main>
      </AppPersistenceContext.Provider>
    );
  }

  return <AppPersistenceContext.Provider value={contextValue}>{children}</AppPersistenceContext.Provider>;
}
