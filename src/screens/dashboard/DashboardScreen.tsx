import { createCalculationSnapshotSelector } from '@/calculations';
import {
  appActions,
  useAppDispatch,
  useAppStore,
} from '@/store';
import { Button, Panel } from '@/ui/primitives';
import { formatCurrency } from '@/utils';

const selectDashboardSnapshot = createCalculationSnapshotSelector();

function getForecastBarWidth(value: number, maxValue: number) {
  if (maxValue <= 0) {
    return '0%';
  }

  return `${Math.max((value / maxValue) * 100, 6)}%`;
}

export function DashboardScreen() {
  const snapshot = useAppStore(selectDashboardSnapshot);
  const dispatch = useAppDispatch();

  const dueSoonBills = snapshot.nextDueLogic.slice(0, 5);
  const renewalAlerts = snapshot.renewalTimingLogic.filter((item) => item.daysUntilRenewal <= 30).slice(0, 4);
  const recentChanges = snapshot.recentChangeDetection.slice(0, 4);
  const categorySnapshot = snapshot.categoryTotals.slice(0, 5);
  const forecastMonths = snapshot.shortRangeCashFlowForecast;
  const maxForecastObligation = Math.max(...forecastMonths.map((month) => month.expectedObligations), 0);
  const hasData =
    snapshot.totalDueThisMonth > 0 ||
    snapshot.totalPaidThisMonth > 0 ||
    snapshot.categoryTotals.length > 0 ||
    snapshot.shortRangeCashFlowForecast.some((month) => month.expectedObligations > 0);

  return (
    <div className="dashboard-screen">
      <Panel className="dashboard-hero" tone="accent" padding="lg">
        <div className="dashboard-hero__content">
          <div>
            <h2>Dashboard</h2>
            <p>
              Live household snapshot driven by canonical bills, payments, and forecast settings. No
              placeholder KPIs, no fake alerts.
            </p>
          </div>

          <div className="screen-inline-actions">
            <Button onClick={() => dispatch(appActions.setActiveDestination('bills'))} variant="primary">
              Go to Bills
            </Button>
            <Button onClick={() => dispatch(appActions.setActiveDestination('forecast'))}>
              Adjust Forecast
            </Button>
          </div>
        </div>
      </Panel>

      <section className="dashboard-kpi-grid" aria-label="Dashboard KPI summary">
        <Panel className="dashboard-kpi-card" tone="surface" padding="lg">
          <p className="dashboard-kpi-card__label">Total due this month</p>
          <p className="dashboard-kpi-card__value">{formatCurrency(snapshot.totalDueThisMonth)}</p>
          <p className="dashboard-kpi-card__meta">
            Paid {formatCurrency(snapshot.totalPaidThisMonth)} so far this month.
          </p>
        </Panel>

        <Panel className="dashboard-kpi-card" tone="surface" padding="lg">
          <p className="dashboard-kpi-card__label">Unpaid this cycle</p>
          <p className="dashboard-kpi-card__value">{formatCurrency(snapshot.unpaidTotalThisCycle)}</p>
          <p className="dashboard-kpi-card__meta">
            End-of-month balance{' '}
            {snapshot.endOfMonthBalanceProjection == null
              ? 'needs income assumptions.'
              : formatCurrency(snapshot.endOfMonthBalanceProjection)}
          </p>
        </Panel>

        <Panel className="dashboard-kpi-card" tone="surface" padding="lg">
          <p className="dashboard-kpi-card__label">Fixed vs variable</p>
          <p className="dashboard-kpi-card__value">
            {formatCurrency(snapshot.fixedTotal)} / {formatCurrency(snapshot.variableTotal)}
          </p>
          <p className="dashboard-kpi-card__meta">Fixed obligations first. Variable costs are the pressure valve.</p>
        </Panel>

        <Panel className="dashboard-kpi-card" tone="surface" padding="lg">
          <p className="dashboard-kpi-card__label">Essential vs optional</p>
          <p className="dashboard-kpi-card__value">
            {formatCurrency(snapshot.essentialTotal)} / {formatCurrency(snapshot.optionalTotal)}
          </p>
          <p className="dashboard-kpi-card__meta">This is where cuts become obvious when cash gets tight.</p>
        </Panel>
      </section>

      {!hasData ? (
        <Panel className="dashboard-empty-state" tone="dense" padding="lg">
          <h3>Dashboard needs real bills before it becomes useful</h3>
          <p>
            Add recurring bills and payments first. The KPI row, due-soon list, alert summary, and
            forecast bars will update automatically from real data.
          </p>
          <div className="screen-inline-actions">
            <Button variant="primary" onClick={() => dispatch(appActions.setActiveDestination('bills'))}>
              Add your first bill
            </Button>
            <Button onClick={() => dispatch(appActions.setActiveDestination('forecast'))}>
              Set forecast assumptions
            </Button>
          </div>
        </Panel>
      ) : null}

      <div className="dashboard-main-grid">
        <Panel className="dashboard-panel" tone="surface" padding="lg">
          <div className="screen-panel__header">
            <div>
              <h3>Forecast view</h3>
              <p className="screen-panel__caption">
                Real month-by-month obligation bars using forecast settings and recurring-bill math.
              </p>
            </div>
          </div>

          {forecastMonths.length === 0 ? (
            <p className="screen-panel__caption">No forecast horizon configured yet.</p>
          ) : (
            <div className="forecast-chart" role="img" aria-label="Projected obligations by month">
              {forecastMonths.map((month) => (
                <div key={month.monthKey} className="forecast-chart__row">
                  <div className="forecast-chart__labels">
                    <span className="forecast-chart__month">{month.monthKey}</span>
                    <span className="forecast-chart__value">{formatCurrency(month.expectedObligations)}</span>
                  </div>
                  <div className="forecast-chart__track" aria-hidden="true">
                    <div
                      className="forecast-chart__fill"
                      style={{ width: getForecastBarWidth(month.expectedObligations, maxForecastObligation) }}
                    />
                  </div>
                  <p className="forecast-chart__meta">
                    {month.projectedRemainingCash == null
                      ? 'Projected cash remaining needs income assumptions.'
                      : `Projected remaining cash ${formatCurrency(month.projectedRemainingCash)}`}
                  </p>
                </div>
              ))}
            </div>
          )}
        </Panel>

        <Panel className="dashboard-panel" tone="dense" padding="lg">
          <div className="screen-panel__header">
            <div>
              <h3>Due soon</h3>
              <p className="screen-panel__caption">Select a bill here to push context into the inspector.</p>
            </div>
          </div>

          {dueSoonBills.length === 0 ? (
            <p className="screen-panel__caption">No upcoming due dates yet.</p>
          ) : (
            <div className="dashboard-list" role="list" aria-label="Upcoming due bills">
              {dueSoonBills.map((bill) => (
                <button
                  key={bill.billId}
                  type="button"
                  className="dashboard-list__row"
                  onClick={() => dispatch(appActions.openBillWorkspace({ billId: bill.billId }))}
                >
                  <div className="dashboard-list__primary">
                    <span className="dashboard-list__title">{bill.billName}</span>
                    <span className="dashboard-list__meta">
                      Due {bill.dueDate} · {bill.daysUntilDue} day{bill.daysUntilDue === 1 ? '' : 's'}
                    </span>
                  </div>
                  <div className="dashboard-list__secondary">
                    <span className="dashboard-list__amount">{formatCurrency(bill.expectedAmount)}</span>
                    <span className="dashboard-list__meta">Unpaid {formatCurrency(bill.unpaidAmount)}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </Panel>
      </div>

      <div className="dashboard-main-grid">
        <Panel className="dashboard-panel" tone="surface" padding="lg">
          <div className="screen-panel__header">
            <div>
              <h3>Alert summary</h3>
              <p className="screen-panel__caption">
                Renewals and amount changes worth attention before they become a surprise.
              </p>
            </div>
          </div>

          <div className="dashboard-alert-grid">
            <div className="dashboard-alert-block">
              <h4>Renewals inside 30 days</h4>
              {renewalAlerts.length === 0 ? (
                <p className="screen-panel__caption">No renewal pressure inside the next 30 days.</p>
              ) : (
                <ul className="dashboard-alert-list">
                  {renewalAlerts.map((item) => (
                    <li key={item.billId}>
                      <span>{item.billName}</span>
                      <span>
                        {item.daysUntilRenewal} day{item.daysUntilRenewal === 1 ? '' : 's'}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="dashboard-alert-block">
              <h4>Recent amount changes</h4>
              {recentChanges.length === 0 ? (
                <p className="screen-panel__caption">No recent payment changes detected yet.</p>
              ) : (
                <ul className="dashboard-alert-list">
                  {recentChanges.map((item) => (
                    <li key={`${item.billId}-${item.changedOn}`}>
                      <span>{item.billName}</span>
                      <span>{item.deltaAmount >= 0 ? '+' : ''}{formatCurrency(item.deltaAmount)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </Panel>

        <Panel className="dashboard-panel" tone="surface" padding="lg">
          <div className="screen-panel__header">
            <div>
              <h3>Category snapshot</h3>
              <p className="screen-panel__caption">
                The top categories are where monthly cash pressure is really coming from.
              </p>
            </div>
          </div>

          {categorySnapshot.length === 0 ? (
            <p className="screen-panel__caption">No category totals yet.</p>
          ) : (
            <div className="dashboard-category-list" role="list" aria-label="Category totals">
              {categorySnapshot.map((category) => (
                <div key={category.category} className="dashboard-category-list__row" role="listitem">
                  <div className="dashboard-category-list__primary">
                    <span className="dashboard-category-list__title">{category.category}</span>
                    <span className="dashboard-category-list__meta">
                      {category.billCount} bill{category.billCount === 1 ? '' : 's'}
                    </span>
                  </div>
                  <div className="dashboard-category-list__secondary">
                    <span className="dashboard-category-list__amount">
                      {formatCurrency(category.expectedAmount)}
                    </span>
                    <span className="dashboard-category-list__meta">
                      Unpaid {formatCurrency(category.unpaidAmount)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Panel>
      </div>
    </div>
  );
}
