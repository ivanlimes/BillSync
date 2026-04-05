import { useMemo, useState } from 'react';
import { createCalculationSnapshotSelector } from '@/calculations';
import { ForecastSettingsEditorPanel } from '@/editing';
import {
  appActions,
  selectEditingState,
  selectForecastSettings,
  useAppDispatch,
  useAppStore,
} from '@/store';
import { Button, Panel } from '@/ui/primitives';
import { formatCurrency } from '@/utils';

const selectForecastSnapshot = createCalculationSnapshotSelector();

const VARIABLE_BUFFER_OPTIONS = [0, 0.1, 0.2] as const;
const INCOME_OFFSET_OPTIONS = [0, -250, -500, 250] as const;

export function ForecastScreen() {
  const settings = useAppStore(selectForecastSettings);
  const editingState = useAppStore(selectEditingState);
  const snapshot = useAppStore(selectForecastSnapshot);
  const dispatch = useAppDispatch();

  const [variableBufferRate, setVariableBufferRate] = useState<(typeof VARIABLE_BUFFER_OPTIONS)[number]>(0);
  const [incomeOffset, setIncomeOffset] = useState<(typeof INCOME_OFFSET_OPTIONS)[number]>(0);

  const variableBufferAmount = Number((snapshot.variableTotal * variableBufferRate).toFixed(2));

  const scenarioForecast = useMemo(() => {
    return snapshot.shortRangeCashFlowForecast.map((month) => {
      const adjustedObligations = Number((month.expectedObligations + variableBufferAmount).toFixed(2));
      const adjustedIncome = month.projectedIncome + incomeOffset;
      const adjustedRemainingCash = settings.monthlyIncomeAssumption == null
        ? null
        : Number((adjustedIncome - adjustedObligations).toFixed(2));

      return {
        ...month,
        adjustedObligations,
        adjustedIncome,
        adjustedRemainingCash,
      };
    });
  }, [incomeOffset, settings.monthlyIncomeAssumption, snapshot.shortRangeCashFlowForecast, variableBufferAmount]);

  const maxScenarioObligation = Math.max(...scenarioForecast.map((month) => month.adjustedObligations), 0);
  const topAnnualizedBills = snapshot.annualizedCostTotals.slice(0, 5);

  return (
    <div className="screen-scaffold forecast-screen">
      <Panel className="screen-scaffold__hero" tone="accent" padding="lg">
        <div className="screen-scaffold__hero-actions">
          <div>
            <h2>Forecast</h2>
            <p>
              Plan upcoming household cash pressure with real forecast math, explicit assumptions,
              and a lightweight what-if preview that does not mutate source truth.
            </p>
          </div>

          <div className="screen-inline-actions">
            <Button variant="primary" onClick={() => dispatch(appActions.openEditor('forecast-edit'))}>
              Edit Forecast Settings
            </Button>
          </div>
        </div>
      </Panel>

      {editingState.kind === 'forecast-edit' ? <ForecastSettingsEditorPanel /> : null}

      <section className="forecast-kpi-grid" aria-label="Forecast summary">
        <Panel className="forecast-kpi-card" tone="surface" padding="lg">
          <p className="forecast-kpi-card__label">Expected cash remaining</p>
          <p className="forecast-kpi-card__value">
            {snapshot.endOfMonthBalanceProjection == null
              ? 'Income assumption needed'
              : formatCurrency(snapshot.endOfMonthBalanceProjection)}
          </p>
          <p className="forecast-kpi-card__meta">
            End-of-month projection using current forecast assumptions and recurring obligations.
          </p>
        </Panel>

        <Panel className="forecast-kpi-card" tone="surface" padding="lg">
          <p className="forecast-kpi-card__label">Next month obligations</p>
          <p className="forecast-kpi-card__value">{formatCurrency(snapshot.nextMonthObligationProjection)}</p>
          <p className="forecast-kpi-card__meta">
            Forward-looking obligation pressure before lifestyle spending and one-off surprises.
          </p>
        </Panel>

        <Panel className="forecast-kpi-card" tone="surface" padding="lg">
          <p className="forecast-kpi-card__label">Fixed vs variable impact</p>
          <p className="forecast-kpi-card__value">
            {formatCurrency(snapshot.fixedTotal)} / {formatCurrency(snapshot.variableTotal)}
          </p>
          <p className="forecast-kpi-card__meta">
            Fixed costs are the hard floor. Variable categories are the only fast adjustment lever.
          </p>
        </Panel>

        <Panel className="forecast-kpi-card" tone="surface" padding="lg">
          <p className="forecast-kpi-card__label">Forecast horizon</p>
          <p className="forecast-kpi-card__value">{settings.forecastHorizonMonths} months</p>
          <p className="forecast-kpi-card__meta">
            Pay schedule: {settings.payScheduleAssumption ?? 'monthly'} · Variable estimates {settings.includeVariableEstimates ? 'included' : 'excluded'}.
          </p>
        </Panel>
      </section>

      <div className="forecast-main-grid">
        <Panel className="forecast-panel" tone="surface" padding="lg">
          <div className="screen-panel__header">
            <div>
              <h3>Forecast controls</h3>
              <p className="screen-panel__caption">
                Canonical assumptions stay in Forecast Settings. The quick what-if below is local preview only.
              </p>
            </div>
          </div>

          <div className="forecast-controls-grid">
            <div className="forecast-settings-summary">
              <div className="forecast-settings-summary__row">
                <span>Monthly income assumption</span>
                <strong>
                  {settings.monthlyIncomeAssumption == null
                    ? 'Not set'
                    : formatCurrency(settings.monthlyIncomeAssumption)}
                </strong>
              </div>
              <div className="forecast-settings-summary__row">
                <span>Pay schedule</span>
                <strong>{settings.payScheduleAssumption ?? 'monthly'}</strong>
              </div>
              <div className="forecast-settings-summary__row">
                <span>Variable estimates</span>
                <strong>{settings.includeVariableEstimates ? 'Included' : 'Excluded'}</strong>
              </div>
              <div className="forecast-settings-summary__row">
                <span>Forecast horizon</span>
                <strong>{settings.forecastHorizonMonths} months</strong>
              </div>
            </div>

            <div className="forecast-whatif-box">
              <h4>Quick what-if preview</h4>
              <div className="forecast-whatif-controls">
                <label className="forecast-whatif-field">
                  <span className="forecast-whatif-field__label">Variable bill pressure</span>
                  <select
                    className="editor-input"
                    value={String(variableBufferRate)}
                    onChange={(event) => setVariableBufferRate(Number(event.target.value) as (typeof VARIABLE_BUFFER_OPTIONS)[number])}
                  >
                    <option value="0">No extra buffer</option>
                    <option value="0.1">+10% variable buffer</option>
                    <option value="0.2">+20% variable buffer</option>
                  </select>
                </label>

                <label className="forecast-whatif-field">
                  <span className="forecast-whatif-field__label">Income offset</span>
                  <select
                    className="editor-input"
                    value={String(incomeOffset)}
                    onChange={(event) => setIncomeOffset(Number(event.target.value) as (typeof INCOME_OFFSET_OPTIONS)[number])}
                  >
                    <option value="0">No income change</option>
                    <option value="-250">Income - $250</option>
                    <option value="-500">Income - $500</option>
                    <option value="250">Income + $250</option>
                  </select>
                </label>
              </div>

              <div className="forecast-whatif-summary">
                <p>
                  Variable buffer added: <strong>{formatCurrency(variableBufferAmount)}</strong>
                </p>
                <p>
                  Income offset applied: <strong>{formatCurrency(incomeOffset)}</strong>
                </p>
                <p className="screen-panel__caption">
                  This preview stays local to the screen and does not create saved branches or mutate canonical forecast settings.
                </p>
              </div>
            </div>
          </div>
        </Panel>

        <Panel className="forecast-panel" tone="dense" padding="lg">
          <div className="screen-panel__header">
            <div>
              <h3>Fixed vs variable impact</h3>
              <p className="screen-panel__caption">
                Household forecast risk is mostly about how much of the total is locked versus adjustable.
              </p>
            </div>
          </div>

          <div className="forecast-impact-stack">
            <div className="forecast-impact-row">
              <div className="forecast-impact-row__labels">
                <span className="forecast-impact-row__title">Fixed obligations</span>
                <span className="forecast-impact-row__value">{formatCurrency(snapshot.fixedTotal)}</span>
              </div>
              <div className="forecast-impact-row__track" aria-hidden="true">
                <div
                  className="forecast-impact-row__fill forecast-impact-row__fill--fixed"
                  style={{ width: getBarWidth(snapshot.fixedTotal, snapshot.fixedTotal + snapshot.variableTotal) }}
                />
              </div>
            </div>

            <div className="forecast-impact-row">
              <div className="forecast-impact-row__labels">
                <span className="forecast-impact-row__title">Variable obligations</span>
                <span className="forecast-impact-row__value">{formatCurrency(snapshot.variableTotal)}</span>
              </div>
              <div className="forecast-impact-row__track" aria-hidden="true">
                <div
                  className="forecast-impact-row__fill forecast-impact-row__fill--variable"
                  style={{ width: getBarWidth(snapshot.variableTotal, snapshot.fixedTotal + snapshot.variableTotal) }}
                />
              </div>
            </div>
          </div>
        </Panel>
      </div>

      <div className="forecast-main-grid">
        <Panel className="forecast-panel" tone="surface" padding="lg">
          <div className="screen-panel__header">
            <div>
              <h3>Forecast output</h3>
              <p className="screen-panel__caption">
                Month-by-month obligations and projected remaining cash driven by the calculation engine.
              </p>
            </div>
          </div>

          {scenarioForecast.length === 0 ? (
            <p className="screen-panel__caption">No forecast horizon configured yet.</p>
          ) : (
            <div className="forecast-output-list" role="list" aria-label="Forecast months">
              {scenarioForecast.map((month) => (
                <div key={month.monthKey} className="forecast-output-row" role="listitem">
                  <div className="forecast-output-row__header">
                    <div className="forecast-output-row__labels">
                      <span className="forecast-output-row__month">{month.monthKey}</span>
                      <span className="forecast-output-row__meta">
                        Obligations {formatCurrency(month.adjustedObligations)}
                      </span>
                    </div>
                    <div className="forecast-output-row__labels forecast-output-row__labels--end">
                      <span className="forecast-output-row__value">
                        {month.adjustedRemainingCash == null
                          ? 'Income assumption needed'
                          : formatCurrency(month.adjustedRemainingCash)}
                      </span>
                      <span className="forecast-output-row__meta">
                        Income {formatCurrency(month.adjustedIncome)}
                      </span>
                    </div>
                  </div>
                  <div className="forecast-output-row__track" aria-hidden="true">
                    <div
                      className="forecast-output-row__fill"
                      style={{ width: getBarWidth(month.adjustedObligations, maxScenarioObligation) }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </Panel>

        <Panel className="forecast-panel" tone="surface" padding="lg">
          <div className="screen-panel__header">
            <div>
              <h3>Annual obligations preview</h3>
              <p className="screen-panel__caption">
                Small recurring costs become large annual pressure when ignored.
              </p>
            </div>
          </div>

          {topAnnualizedBills.length === 0 ? (
            <p className="screen-panel__caption">No annualized obligation data yet.</p>
          ) : (
            <div className="forecast-annual-list" role="list" aria-label="Annualized obligations preview">
              {topAnnualizedBills.map((item) => (
                <div key={item.billId} className="forecast-annual-list__row" role="listitem">
                  <div className="forecast-annual-list__labels">
                    <span className="forecast-annual-list__title">{item.billName}</span>
                    <span className="forecast-annual-list__meta">Annualized expected cost</span>
                  </div>
                  <strong className="forecast-annual-list__value">
                    {formatCurrency(item.annualizedExpectedAmount)}
                  </strong>
                </div>
              ))}
            </div>
          )}
        </Panel>
      </div>
    </div>
  );
}

function getBarWidth(value: number, maxValue: number) {
  if (maxValue <= 0) {
    return '0%';
  }

  return `${Math.max((value / maxValue) * 100, 8).toFixed(1)}%`;
}
