import { initialAppState } from '@/store/initialState';
import { appReducer } from '@/store/reducer';
import type { AppStore } from '@/store/contracts/AppStore';
import type { AppAction } from '@/store/mutations/actions';
import type { AppState } from '@/store/state';

export function createAppStore(seedState: AppState = initialAppState): AppStore {
  let currentState = seedState;
  const listeners = new Set<() => void>();

  function notify() {
    listeners.forEach((listener) => {
      listener();
    });
  }

  function dispatch(action: AppAction) {
    const nextState = appReducer(currentState, action);

    if (nextState === currentState) {
      return;
    }

    currentState = nextState;
    notify();
  }

  return {
    getState() {
      return currentState;
    },
    dispatch,
    subscribe(listener) {
      listeners.add(listener);

      return () => {
        listeners.delete(listener);
      };
    },
  };
}
