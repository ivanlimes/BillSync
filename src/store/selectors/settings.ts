import type { AppState } from '@/store/state';

export function selectForecastSettings(state: AppState) {
  return state.forecastSettings;
}

export function selectPreferences(state: AppState) {
  return state.preferences;
}
