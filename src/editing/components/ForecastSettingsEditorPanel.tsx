import { useEffect, useState, type FormEvent } from 'react';
import {
  appActions,
  selectEditingState,
  selectForecastSettings,
  useAppDispatch,
  useAppStore,
} from '@/store';
import type { ForecastHorizon, PayScheduleAssumption } from '@/domain';
import { Button, Panel } from '@/ui/primitives';
import {
  getForecastFormValues,
  validateForecastForm,
  type ForecastFormValues,
} from '@/editing/forms/forecastForm';

const payScheduleOptions: PayScheduleAssumption[] = [
  'monthly',
  'biweekly',
  'weekly',
  'semimonthly',
  'custom',
];
const horizonOptions: ForecastHorizon[] = [1, 2, 3, 6, 12];

export function ForecastSettingsEditorPanel() {
  const editingState = useAppStore(selectEditingState);
  const settings = useAppStore(selectForecastSettings);
  const dispatch = useAppDispatch();

  const [values, setValues] = useState<ForecastFormValues>(() => getForecastFormValues(settings));
  const [errors, setErrors] = useState<Partial<Record<keyof ForecastFormValues, string>>>({});

  useEffect(() => {
    setValues(getForecastFormValues(settings));
    setErrors({});
  }, [settings, editingState.kind]);

  if (editingState.kind !== 'forecast-edit') {
    return null;
  }

  function updateValue<TKey extends keyof ForecastFormValues>(key: TKey, nextValue: ForecastFormValues[TKey]) {
    setValues((current) => ({ ...current, [key]: nextValue }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors = validateForecastForm(values);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    dispatch(
      appActions.updateForecastSettings({
        monthlyIncomeAssumption:
          values.monthlyIncomeAssumption.trim() === ''
            ? undefined
            : Number(values.monthlyIncomeAssumption),
        payScheduleAssumption: values.payScheduleAssumption,
        includeVariableEstimates: values.includeVariableEstimates,
        forecastHorizonMonths: values.forecastHorizonMonths,
      }),
    );
    dispatch(appActions.closeEditor());
  }

  return (
    <Panel className="editor-panel" tone="surface" padding="lg">
      <div className="editor-panel__header">
        <div>
          <h3>Edit Forecast Settings</h3>
          <p className="editor-panel__caption">
            Forecast settings update the canonical assumptions only. Forecast outputs remain derived.
          </p>
        </div>
      </div>

      <form className="editor-form" onSubmit={handleSubmit}>
        <div className="editor-form__grid editor-form__grid--two-column">
          <label className="editor-field">
            <span className="editor-field__label">Monthly income assumption</span>
            <input
              className="editor-input"
              inputMode="decimal"
              value={values.monthlyIncomeAssumption}
              onChange={(event) => updateValue('monthlyIncomeAssumption', event.target.value)}
            />
            {errors.monthlyIncomeAssumption ? (
              <span className="editor-field__error">{errors.monthlyIncomeAssumption}</span>
            ) : null}
          </label>

          <label className="editor-field">
            <span className="editor-field__label">Pay schedule</span>
            <select
              className="editor-input"
              value={values.payScheduleAssumption}
              onChange={(event) =>
                updateValue('payScheduleAssumption', event.target.value as PayScheduleAssumption)
              }
            >
              {payScheduleOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          <label className="editor-field">
            <span className="editor-field__label">Forecast horizon</span>
            <select
              className="editor-input"
              value={values.forecastHorizonMonths}
              onChange={(event) =>
                updateValue('forecastHorizonMonths', Number(event.target.value) as ForecastHorizon)
              }
            >
              {horizonOptions.map((option) => (
                <option key={option} value={option}>
                  {option} month{option > 1 ? 's' : ''}
                </option>
              ))}
            </select>
          </label>

          <label className="editor-field">
            <span className="editor-field__label">Variable estimates</span>
            <select
              className="editor-input"
              value={values.includeVariableEstimates ? 'true' : 'false'}
              onChange={(event) =>
                updateValue('includeVariableEstimates', event.target.value === 'true')
              }
            >
              <option value="true">Include estimates</option>
              <option value="false">Exclude estimates</option>
            </select>
          </label>
        </div>

        <div className="editor-panel__actions">
          <Button type="submit" variant="primary">
            Save Forecast Settings
          </Button>
          <Button onClick={() => dispatch(appActions.closeEditor())}>Cancel</Button>
        </div>
      </form>
    </Panel>
  );
}
