import { useMemo, useState } from 'react';
import { getLocalStorage } from '@/persistence/local/getLocalStorage';
import { STORAGE_KEYS } from '@/persistence/local/storageKeys';
import { useAppPersistenceStatus } from '@/persistence/react/AppPersistenceContext';
import { appActions, initialAppState, selectForecastSettings, selectPreferences, useAppDispatch, useAppStore } from '@/store';
import { Button, Panel } from '@/ui/primitives';
import type { BillFilterKey, BillSortKey, DensityMode, ThemeMode } from '@/domain';

const THEME_MODE_OPTIONS: Array<{ value: ThemeMode; label: string; description: string }> = [
  { value: 'system', label: 'System', description: 'Follow the device appearance setting.' },
  { value: 'light', label: 'Light', description: 'Use a brighter workspace shell.' },
  { value: 'dark', label: 'Dark', description: 'Use the warmer dark shell.' },
];

const ACCENT_OPTIONS = [
  { value: 'dusty-plum', label: 'Dusty plum', description: 'The locked default accent.' },
  { value: 'ink-blue', label: 'Ink blue', description: 'Cooler and slightly more neutral.' },
  { value: 'sage', label: 'Muted sage', description: 'Soft green accent with restrained contrast.' },
] as const;

const BACKDROP_OPTIONS = [
  { value: 'default', label: 'Default', description: 'Neutral shell backdrop with no extra atmosphere.' },
  { value: 'paper', label: 'Warm paper', description: 'Soft paper-like wash behind the shell only.' },
  { value: 'night-plum', label: 'Night plum', description: 'Subtle plum backdrop behind the shell only.' },
] as const;

const DENSITY_OPTIONS: Array<{ value: DensityMode; label: string; description: string }> = [
  { value: 'comfortable', label: 'Comfortable', description: 'More breathing room for daily use.' },
  { value: 'compact', label: 'Compact', description: 'Tighter spacing for denser screens.' },
];

const SORT_OPTIONS: Array<{ value: BillSortKey; label: string }> = [
  { value: 'nextDueDate', label: 'Next due date' },
  { value: 'name', label: 'Bill name' },
  { value: 'expectedAmount', label: 'Expected amount' },
  { value: 'category', label: 'Category' },
];

const FILTER_OPTIONS: Array<{ value: BillFilterKey; label: string }> = [
  { value: 'all', label: 'All bills' },
  { value: 'due-soon', label: 'Due soon' },
  { value: 'subscriptions', label: 'Subscriptions' },
  { value: 'annual', label: 'Annual' },
  { value: 'autopay', label: 'AutoPay' },
];

const REMINDER_DEFAULT_OPTIONS = [
  { value: '7-days', label: '7 days before' },
  { value: '1-day', label: '1 day before' },
  { value: 'day-of', label: 'Day of due date' },
] as const;

export function SettingsScreen() {
  const preferences = useAppStore(selectPreferences);
  const forecastSettings = useAppStore(selectForecastSettings);
  const appState = useAppStore((state) => state);
  const persistenceStatus = useAppPersistenceStatus();
  const dispatch = useAppDispatch();
  const [dataMessage, setDataMessage] = useState<string | null>(null);

  const selectedReminderDefaults = useMemo(() => new Set(preferences.reminderDefaults ?? ['7-days', '1-day']), [preferences.reminderDefaults]);

  const exportSummary = useMemo(() => {
    return `${appState.entities.bills.allIds.length} bills · ${appState.entities.payments.allIds.length} payments · horizon ${forecastSettings.forecastHorizonMonths} months`;
  }, [appState.entities.bills.allIds.length, appState.entities.payments.allIds.length, forecastSettings.forecastHorizonMonths]);

  function updatePreferences<T extends keyof typeof preferences>(key: T, value: (typeof preferences)[T]) {
    dispatch(appActions.updatePreferences({ [key]: value }));
  }

  function toggleReminderDefault(value: string) {
    const nextValues = new Set(selectedReminderDefaults);

    if (nextValues.has(value)) {
      nextValues.delete(value);
    } else {
      nextValues.add(value);
    }

    dispatch(appActions.updatePreferences({ reminderDefaults: Array.from(nextValues) }));
  }

  function exportLocalData() {
    const payload = JSON.stringify(appState, null, 2);

    if (typeof window === 'undefined' || typeof document === 'undefined') {
      setDataMessage('Export is only available in a browser session.');
      return;
    }

    const blob = new Blob([payload], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'family-monthly-bills-local-data.json';
    anchor.click();
    window.URL.revokeObjectURL(url);
    setDataMessage('Local data export created.');
  }

  function resetLocalData() {
    const storage = getLocalStorage();
    storage?.removeItem(STORAGE_KEYS.appState);
    storage?.removeItem(STORAGE_KEYS.schemaVersion);

    dispatch(
      appActions.replaceState({
        ...initialAppState,
        ui: {
          ...initialAppState.ui,
          activeDestination: 'settings',
        },
      }),
    );

    setDataMessage('Local data cleared and canonical state reset to the initial V1 baseline.');
  }

  return (
    <div className="screen-scaffold settings-screen">
      <Panel className="screen-scaffold__hero" tone="accent" padding="lg">
        <div className="settings-hero__content">
          <div>
            <h2>Settings</h2>
            <p>
              Keep this surface narrow: appearance, behavior defaults, and local data controls only.
              No reminders engine, no collaboration plumbing, no backup-admin sprawl.
            </p>
          </div>

          <div className="settings-hero__status">
            <span className="settings-status-pill" data-tone={persistenceStatus.error ? 'warning' : 'neutral'}>
              {persistenceStatus.error ? 'Local persistence warning' : 'Local-first storage active'}
            </span>
            <span className="settings-hero__meta">
              {persistenceStatus.lastSavedAt
                ? `Last saved ${new Date(persistenceStatus.lastSavedAt).toLocaleString()}`
                : 'Changes save locally after hydration completes'}
            </span>
          </div>
        </div>
      </Panel>

      <div className="settings-grid">
        <Panel className="settings-panel" tone="surface" padding="lg">
          <div className="screen-panel__header">
            <div>
              <h3>Appearance</h3>
              <p className="screen-panel__caption">
                Background personalization belongs here and affects the outer shell only, never dense working surfaces.
              </p>
            </div>
          </div>

          <div className="settings-section">
            <label className="settings-field">
              <span className="editor-field__label">Theme mode</span>
              <select
                className="editor-input"
                value={preferences.themeMode}
                onChange={(event) => updatePreferences('themeMode', event.target.value as ThemeMode)}
              >
                {THEME_MODE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <p className="settings-help-text">
              {THEME_MODE_OPTIONS.find((option) => option.value === preferences.themeMode)?.description}
            </p>
          </div>

          <div className="settings-section">
            <span className="editor-field__label">Accent preference</span>
            <div className="settings-choice-grid" role="radiogroup" aria-label="Accent preference">
              {ACCENT_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className="settings-choice-card"
                  data-active={String(preferences.accentPreference === option.value)}
                  onClick={() => updatePreferences('accentPreference', option.value)}
                >
                  <strong>{option.label}</strong>
                  <span>{option.description}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="settings-section">
            <span className="editor-field__label">Shell backdrop</span>
            <div className="settings-choice-grid" role="radiogroup" aria-label="Shell backdrop preference">
              {BACKDROP_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className="settings-choice-card"
                  data-active={String(preferences.backgroundPreference === option.value)}
                  onClick={() => updatePreferences('backgroundPreference', option.value)}
                >
                  <strong>{option.label}</strong>
                  <span>{option.description}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="settings-section">
            <span className="editor-field__label">Density</span>
            <div className="settings-choice-grid" role="radiogroup" aria-label="Density mode">
              {DENSITY_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className="settings-choice-card"
                  data-active={String((preferences.densityMode ?? 'comfortable') === option.value)}
                  onClick={() => updatePreferences('densityMode', option.value)}
                >
                  <strong>{option.label}</strong>
                  <span>{option.description}</span>
                </button>
              ))}
            </div>
          </div>
        </Panel>

        <Panel className="settings-panel" tone="surface" padding="lg">
          <div className="screen-panel__header">
            <div>
              <h3>Behavior defaults</h3>
              <p className="screen-panel__caption">
                These are app-level defaults, not per-screen overrides or workflow hacks.
              </p>
            </div>
          </div>

          <div className="settings-form-grid">
            <label className="settings-field">
              <span className="editor-field__label">Default bill sort</span>
              <select
                className="editor-input"
                value={preferences.defaultSort}
                onChange={(event) => updatePreferences('defaultSort', event.target.value as BillSortKey)}
              >
                {SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="settings-field">
              <span className="editor-field__label">Default bill filter</span>
              <select
                className="editor-input"
                value={preferences.defaultFilter}
                onChange={(event) => updatePreferences('defaultFilter', event.target.value as BillFilterKey)}
              >
                {FILTER_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="settings-section">
            <span className="editor-field__label">Reminder defaults</span>
            <div className="settings-toggle-list" role="group" aria-label="Reminder defaults">
              {REMINDER_DEFAULT_OPTIONS.map((option) => (
                <label key={option.value} className="settings-toggle-row">
                  <input
                    type="checkbox"
                    checked={selectedReminderDefaults.has(option.value)}
                    onChange={() => toggleReminderDefault(option.value)}
                  />
                  <span>{option.label}</span>
                </label>
              ))}
            </div>
            <p className="settings-help-text">
              Stored as app-level defaults only. This does not create reminder infrastructure early.
            </p>
          </div>

          <div className="settings-preview-callout">
            <strong>Current forecast baseline</strong>
            <span>
              {forecastSettings.forecastHorizonMonths}-month horizon · variable estimates{' '}
              {forecastSettings.includeVariableEstimates ? 'included' : 'excluded'}
            </span>
          </div>
        </Panel>
      </div>

      <div className="settings-grid settings-grid--data">
        <Panel className="settings-panel" tone="dense" padding="lg">
          <div className="screen-panel__header">
            <div>
              <h3>Local data controls</h3>
              <p className="screen-panel__caption">
                Keep local-first controls obvious and reversible. Do not turn this into a backup admin console.
              </p>
            </div>
          </div>

          <dl className="settings-data-summary">
            <div className="settings-data-summary__row">
              <dt>Snapshot</dt>
              <dd>{exportSummary}</dd>
            </div>
            <div className="settings-data-summary__row">
              <dt>Persistence</dt>
              <dd>{persistenceStatus.error ? persistenceStatus.error : 'Healthy local storage round-trip'}</dd>
            </div>
          </dl>

          <div className="screen-inline-actions">
            <Button variant="primary" onClick={exportLocalData}>
              Export local data
            </Button>
            <Button onClick={resetLocalData}>Reset local data</Button>
            <Button variant="disabled" disabled aria-disabled="true">
              Import/restore — later
            </Button>
          </div>

          {dataMessage ? <p className="settings-help-text">{dataMessage}</p> : null}
        </Panel>

        <Panel className="settings-panel" tone="surface" padding="lg">
          <div className="screen-panel__header">
            <div>
              <h3>Guardrails</h3>
              <p className="screen-panel__caption">
                Settings stays app-level. It does not own operational workflow, Bills detail depth, or Forecast math.
              </p>
            </div>
          </div>

          <ul className="screen-scaffold__list settings-guardrail-list">
            <li>Background personalization stays behind the shell, not inside dense financial surfaces.</li>
            <li>Reminder defaults are stored here without creating notification plumbing early.</li>
            <li>Import/restore remains intentionally narrow until hardening proves the schema is stable.</li>
            <li>Default sort and filter live here as app preferences, not as one-off screen hacks.</li>
          </ul>
        </Panel>
      </div>
    </div>
  );
}
