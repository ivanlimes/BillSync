function canUseBrowserStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

export function getLocalStorage(): Storage | null {
  if (!canUseBrowserStorage()) {
    return null;
  }

  try {
    const storage = window.localStorage;
    const probeKey = '__family-monthly-bills.storage-probe__';

    storage.setItem(probeKey, probeKey);
    storage.removeItem(probeKey);

    return storage;
  } catch {
    return null;
  }
}
