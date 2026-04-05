import { createCalculationSnapshot } from '@/calculations/engine/createCalculationSnapshot';
import type { CalculationSnapshot } from '@/calculations/engine/types';
import type { AppState } from '@/store/state';

export function createCalculationSnapshotSelector(nowProvider: () => Date = () => new Date()) {
  let lastState: AppState | null = null;
  let lastSnapshot: CalculationSnapshot | null = null;

  return function selectCalculationSnapshot(state: AppState): CalculationSnapshot {
    if (lastState === state && lastSnapshot !== null) {
      return lastSnapshot;
    }

    const snapshot = createCalculationSnapshot({ now: nowProvider(), state });
    lastState = state;
    lastSnapshot = snapshot;

    return snapshot;
  };
}
