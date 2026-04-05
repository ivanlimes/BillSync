import { createContext, useContext } from 'react';

export interface AppPersistenceStatus {
  isHydrated: boolean;
  lastSavedAt: string | null;
  error: string | null;
}

export const defaultPersistenceStatus: AppPersistenceStatus = {
  isHydrated: false,
  lastSavedAt: null,
  error: null,
};

export const AppPersistenceContext = createContext<AppPersistenceStatus>(defaultPersistenceStatus);

export function useAppPersistenceStatus() {
  return useContext(AppPersistenceContext);
}
