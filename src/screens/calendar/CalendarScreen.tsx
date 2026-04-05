import { createCalculationSnapshotSelector } from '@/calculations';
import { appActions, selectBills, selectPayments, useAppDispatch, useAppStore } from '@/store';
import { Button, Panel } from '@/ui/primitives';
import { formatCurrency } from '@/utils';

type CalendarEventType = 'due' | 'renewal' | 'payment';

interface CalendarEventItem {
  id: string;
  type: CalendarEventType;
  billId: string;
  billName: string;
  title: string;
  isoDate: string;
  dayOffset: number;
  amount?: number;
  meta: string;
}

const selectCalendarSnapshot = createCalculationSnapshotSelector();

function parseIsoDate(value: string) {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, (month ?? 1) - 1, day ?? 1);
}

function formatIsoDateLabel(value: string) {
  const date = parseIsoDate(value);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

function formatMonthLabel(date: Date) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    year: 'numeric',
  }).format(date);
}

function formatDayNumber(date: Date) {
  return new Intl.DateTimeFormat('en-US', { day: 'numeric' }).format(date);
}

function formatWeekday(date: Date) {
  return new Intl.DateTimeFormat('en-US', { weekday: 'short' }).format(date);
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function endOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

function startOfWeek(date: Date) {
  const copy = new Date(date);
  const offset = copy.getDay();
  copy.setDate(copy.getDate() - offset);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function endOfWeek(date: Date) {
  const copy = startOfWeek(date);
  copy.setDate(copy.getDate() + 6);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function addDays(date: Date, amount: number) {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + amount);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function differenceInDays(target: Date, base: Date) {
  const msPerDay = 24 * 60 * 60 * 1000;
  return Math.round((target.getTime() - base.getTime()) / msPerDay);
}

function describeOffset(offset: number) {
  if (offset === 0) {
    return 'Today';
  }

  if (offset === 1) {
    return 'Tomorrow';
  }

  if (offset === -1) {
    return 'Yesterday';
  }

  if (offset > 1) {
    return `In ${offset} days`;
  }

  return `${Math.abs(offset)} days ago`;
}

function getEventTypeLabel(type: CalendarEventType) {
  switch (type) {
    case 'due':
      return 'Due';
    case 'renewal':
      return 'Renewal';
    case 'payment':
      return 'Paid';
  }
}

function buildCalendarEvents(args: {
  generatedAt: string;
  nextDueLogic: ReturnType<typeof selectCalendarSnapshot>['nextDueLogic'];
  renewalTimingLogic: ReturnType<typeof selectCalendarSnapshot>['renewalTimingLogic'];
  payments: ReturnType<typeof selectPayments>;
  bills: ReturnType<typeof selectBills>;
}) {
  const now = parseIsoDate(args.generatedAt.slice(0, 10));
  const activeBillMap = new Map(args.bills.map((bill) => [bill.id, bill]));

  const dueEvents: CalendarEventItem[] = args.nextDueLogic.map((item) => ({
    id: `due:${item.billId}:${item.dueDate}`,
    type: 'due',
    billId: item.billId,
    billName: item.billName,
    title: `${item.billName} due`,
    isoDate: item.dueDate,
    dayOffset: item.daysUntilDue,
    amount: item.unpaidAmount > 0 ? item.unpaidAmount : item.expectedAmount,
    meta:
      item.unpaidAmount > 0
        ? `Unpaid ${formatCurrency(item.unpaidAmount)} still needs attention.`
        : `Expected ${formatCurrency(item.expectedAmount)} due.`,
  }));

  const renewalEvents: CalendarEventItem[] = args.renewalTimingLogic.map((item) => ({
    id: `renewal:${item.billId}:${item.nextDueDate}`,
    type: 'renewal',
    billId: item.billId,
    billName: item.billName,
    title: `${item.billName} renewal`,
    isoDate: item.nextDueDate,
    dayOffset: item.daysUntilRenewal,
    amount: activeBillMap.get(item.billId)?.expectedAmount,
    meta: item.renewalBehavior || 'Recurring renewal timing',
  }));

  const paymentEvents: CalendarEventItem[] = args.payments.map((payment) => {
    const bill = activeBillMap.get(payment.billId);
    const eventDate = parseIsoDate(payment.paymentDate);

    return {
      id: `payment:${payment.id}`,
      type: 'payment',
      billId: payment.billId,
      billName: bill?.name ?? 'Unknown bill',
      title: `${bill?.name ?? 'Bill'} paid`,
      isoDate: payment.paymentDate,
      dayOffset: differenceInDays(eventDate, now),
      amount: payment.amount,
      meta: `${payment.paymentType === 'autopay' ? 'AutoPay' : 'Manual'} payment recorded.`,
    };
  });

  return [...dueEvents, ...renewalEvents, ...paymentEvents].sort((left, right) => {
    if (left.isoDate === right.isoDate) {
      const order = { due: 0, renewal: 1, payment: 2 };
      return order[left.type] - order[right.type];
    }

    return left.isoDate.localeCompare(right.isoDate);
  });
}

function buildMonthCells(monthAnchor: Date, events: CalendarEventItem[]) {
  const monthStart = startOfMonth(monthAnchor);
  const monthEnd = endOfMonth(monthAnchor);
  const gridStart = startOfWeek(monthStart);
  const gridEnd = endOfWeek(monthEnd);
  const eventCountMap = new Map<string, number>();
  const eventTypesByDate = new Map<string, Set<CalendarEventType>>();

  for (const event of events) {
    eventCountMap.set(event.isoDate, (eventCountMap.get(event.isoDate) ?? 0) + 1);
    const currentTypes = eventTypesByDate.get(event.isoDate) ?? new Set<CalendarEventType>();
    currentTypes.add(event.type);
    eventTypesByDate.set(event.isoDate, currentTypes);
  }

  const cells: Array<{
    isoDate: string;
    dayLabel: string;
    inMonth: boolean;
    isToday: boolean;
    eventCount: number;
    hasDue: boolean;
    hasRenewal: boolean;
    hasPayment: boolean;
  }> = [];

  for (let cursor = new Date(gridStart); cursor <= gridEnd; cursor = addDays(cursor, 1)) {
    const isoDate = cursor.toISOString().slice(0, 10);
    const types = eventTypesByDate.get(isoDate) ?? new Set<CalendarEventType>();
    cells.push({
      isoDate,
      dayLabel: formatDayNumber(cursor),
      inMonth: cursor.getMonth() === monthAnchor.getMonth(),
      isToday: isoDate === new Date().toISOString().slice(0, 10),
      eventCount: eventCountMap.get(isoDate) ?? 0,
      hasDue: types.has('due'),
      hasRenewal: types.has('renewal'),
      hasPayment: types.has('payment'),
    });
  }

  return cells;
}

export function CalendarScreen() {
  const snapshot = useAppStore(selectCalendarSnapshot);
  const bills = useAppStore(selectBills);
  const payments = useAppStore(selectPayments);
  const dispatch = useAppDispatch();

  const monthAnchor = parseIsoDate(snapshot.generatedAt.slice(0, 10));
  const allEvents = buildCalendarEvents({
    generatedAt: snapshot.generatedAt,
    nextDueLogic: snapshot.nextDueLogic,
    renewalTimingLogic: snapshot.renewalTimingLogic,
    payments,
    bills,
  });

  const agendaEvents = allEvents.filter((item) => item.dayOffset >= -7 && item.dayOffset <= 45);
  const upcomingDue = allEvents
    .filter((item) => item.type === 'due' && item.dayOffset >= 0)
    .slice(0, 5);
  const recentPayments = allEvents
    .filter((item) => item.type === 'payment')
    .sort((left, right) => right.isoDate.localeCompare(left.isoDate))
    .slice(0, 5);
  const renewalPressure = allEvents
    .filter((item) => item.type === 'renewal' && item.dayOffset >= 0)
    .slice(0, 5);
  const monthCells = buildMonthCells(monthAnchor, agendaEvents);

  const hasCalendarData = allEvents.length > 0;

  return (
    <div className="calendar-screen">
      <Panel className="calendar-hero" tone="accent" padding="lg">
        <div className="calendar-hero__content">
          <div>
            <h2>Calendar</h2>
            <p>
              Timing visibility only. This screen exists to show what is due soon, what renews soon,
              what was paid, and what needs attention next — not to become a generic scheduling app.
            </p>
          </div>

          <div className="screen-inline-actions">
            <Button variant="primary" onClick={() => dispatch(appActions.setActiveDestination('bills'))}>
              Manage bills
            </Button>
            <Button onClick={() => dispatch(appActions.setActiveDestination('forecast'))}>
              Review forecast
            </Button>
          </div>
        </div>
      </Panel>

      <section className="calendar-summary-strip" aria-label="Calendar timing summary">
        <Panel className="calendar-summary-card" tone="surface" padding="lg">
          <p className="calendar-summary-card__label">Upcoming due items</p>
          <p className="calendar-summary-card__value">{upcomingDue.length}</p>
          <p className="calendar-summary-card__meta">Bills still coming up in the current timing window.</p>
        </Panel>

        <Panel className="calendar-summary-card" tone="surface" padding="lg">
          <p className="calendar-summary-card__label">Renewals inside window</p>
          <p className="calendar-summary-card__value">{renewalPressure.length}</p>
          <p className="calendar-summary-card__meta">Annual and recurring renewals that need attention soon.</p>
        </Panel>

        <Panel className="calendar-summary-card" tone="surface" padding="lg">
          <p className="calendar-summary-card__label">Recent payment events</p>
          <p className="calendar-summary-card__value">{recentPayments.length}</p>
          <p className="calendar-summary-card__meta">Recorded payment activity already reflected in the model.</p>
        </Panel>

        <Panel className="calendar-summary-card" tone="surface" padding="lg">
          <p className="calendar-summary-card__label">Month in view</p>
          <p className="calendar-summary-card__value">{formatMonthLabel(monthAnchor)}</p>
          <p className="calendar-summary-card__meta">Compact month grid plus agenda for timing visibility.</p>
        </Panel>
      </section>

      {!hasCalendarData ? (
        <Panel className="calendar-empty-state" tone="dense" padding="lg">
          <h3>Calendar needs real bills and payments before timing becomes useful</h3>
          <p>
            Add recurring bills and payment records first. Due dates, renewals, and payment events will
            appear here automatically from canonical data.
          </p>
          <div className="screen-inline-actions">
            <Button variant="primary" onClick={() => dispatch(appActions.setActiveDestination('bills'))}>
              Add your first bill
            </Button>
          </div>
        </Panel>
      ) : null}

      <div className="calendar-main-grid">
        <Panel className="calendar-panel" tone="surface" padding="lg">
          <div className="screen-panel__header">
            <div>
              <h3>{formatMonthLabel(monthAnchor)}</h3>
              <p className="screen-panel__caption">
                Compact month grid for due dates, renewals, and payment events. Dense enough to scan,
                not pretending to be a full scheduling platform.
              </p>
            </div>
          </div>

          <div className="calendar-grid" role="grid" aria-label="Calendar month timing view">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((weekday) => (
              <div key={weekday} className="calendar-grid__weekday" role="columnheader">
                {weekday}
              </div>
            ))}

            {monthCells.map((cell) => (
              <div
                key={cell.isoDate}
                className="calendar-grid__cell"
                data-in-month={cell.inMonth}
                data-today={cell.isToday}
                role="gridcell"
                aria-label={`${formatIsoDateLabel(cell.isoDate)} with ${cell.eventCount} timing event${cell.eventCount === 1 ? '' : 's'}`}
              >
                <div className="calendar-grid__cell-top">
                  <span className="calendar-grid__day">{cell.dayLabel}</span>
                  {cell.eventCount > 0 ? <span className="calendar-grid__count">{cell.eventCount}</span> : null}
                </div>
                <div className="calendar-grid__markers" aria-hidden="true">
                  {cell.hasDue ? <span className="calendar-grid__marker calendar-grid__marker--due" /> : null}
                  {cell.hasRenewal ? <span className="calendar-grid__marker calendar-grid__marker--renewal" /> : null}
                  {cell.hasPayment ? <span className="calendar-grid__marker calendar-grid__marker--payment" /> : null}
                </div>
              </div>
            ))}
          </div>
        </Panel>

        <Panel className="calendar-panel" tone="dense" padding="lg">
          <div className="screen-panel__header">
            <div>
              <h3>Agenda</h3>
              <p className="screen-panel__caption">
                Timing list for the next 45 days plus the most recent payment activity.
              </p>
            </div>
          </div>

          {agendaEvents.length === 0 ? (
            <p className="screen-panel__caption">No due, renewal, or payment timing events in the current window.</p>
          ) : (
            <div className="calendar-agenda" role="list" aria-label="Calendar agenda">
              {agendaEvents.map((event) => (
                <button
                  key={event.id}
                  type="button"
                  className="calendar-agenda__row"
                  data-type={event.type}
                  onClick={() => {
                    dispatch(appActions.selectBill(event.billId));
                    dispatch(appActions.setActiveDestination('bills'));
                  }}
                >
                  <div className="calendar-agenda__date-block">
                    <span className="calendar-agenda__date-day">{formatDayNumber(parseIsoDate(event.isoDate))}</span>
                    <span className="calendar-agenda__date-meta">{formatWeekday(parseIsoDate(event.isoDate))}</span>
                  </div>

                  <div className="calendar-agenda__content">
                    <div className="calendar-agenda__title-row">
                      <span className="calendar-agenda__type-pill" data-type={event.type}>
                        {getEventTypeLabel(event.type)}
                      </span>
                      <span className="calendar-agenda__title">{event.title}</span>
                    </div>
                    <p className="calendar-agenda__meta">
                      {formatIsoDateLabel(event.isoDate)} · {describeOffset(event.dayOffset)}
                    </p>
                    <p className="calendar-agenda__meta">{event.meta}</p>
                  </div>

                  <div className="calendar-agenda__amount-block">
                    {event.amount != null ? (
                      <span className="calendar-agenda__amount">{formatCurrency(event.amount)}</span>
                    ) : (
                      <span className="calendar-agenda__amount calendar-agenda__amount--empty">—</span>
                    )}
                    <span className="calendar-agenda__jump">Open bill</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </Panel>
      </div>
    </div>
  );
}
