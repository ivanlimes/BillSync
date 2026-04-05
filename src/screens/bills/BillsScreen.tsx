import { useMemo } from 'react';
import { createCalculationSnapshotSelector } from '@/calculations';
import { BillEditorPanel, PaymentEditorPanel } from '@/editing';
import type { BillFilterKey, BillSortKey } from '@/domain';
import {
  appActions,
  selectBills,
  selectBillsWorkspaceState,
  selectEditingState,
  selectPayments,
  selectSelectedBill,
  useAppDispatch,
  useAppStore,
} from '@/store';
import { Button, Panel } from '@/ui/primitives';
import { formatCurrency } from '@/utils';
import { applyBillFilter, applyBillSearch, applyBillSort, createBillTableRows } from '@/screens/bills/billRows';

const selectBillsSnapshot = createCalculationSnapshotSelector();
const FILTER_OPTIONS: Array<{ key: BillFilterKey; label: string }> = [
  { key: 'all', label: 'All bills' },
  { key: 'due-soon', label: 'Due soon' },
  { key: 'subscriptions', label: 'Subscriptions' },
  { key: 'annual', label: 'Annual' },
  { key: 'autopay', label: 'AutoPay' },
];

const SORT_OPTIONS: Array<{ key: BillSortKey; label: string }> = [
  { key: 'nextDueDate', label: 'Next due' },
  { key: 'name', label: 'Name' },
  { key: 'expectedAmount', label: 'Expected amount' },
  { key: 'category', label: 'Category' },
];

export function BillsScreen() {
  const bills = useAppStore(selectBills);
  const payments = useAppStore(selectPayments);
  const snapshot = useAppStore(selectBillsSnapshot);
  const selectedBill = useAppStore(selectSelectedBill);
  const editingState = useAppStore(selectEditingState);
  const billsWorkspace = useAppStore(selectBillsWorkspaceState);
  const dispatch = useAppDispatch();

  const searchQuery = billsWorkspace.searchQuery;
  const activeFilter = billsWorkspace.activeFilter;
  const sortKey = billsWorkspace.sortKey;

  const rows = useMemo(() => createBillTableRows(bills, payments, snapshot), [bills, payments, snapshot]);
  const visibleRows = useMemo(() => {
    const searchedRows = applyBillSearch(rows, searchQuery);
    const filteredRows = applyBillFilter(searchedRows, activeFilter);
    return applyBillSort(filteredRows, sortKey);
  }, [activeFilter, rows, searchQuery, sortKey]);

  const autopayCount = rows.filter((row) => row.autopayEnabled).length;
  const annualCount = rows.filter((row) => row.frequency === 'annual').length;
  const dueSoonCount = rows.filter((row) => row.state === 'active' && daysUntil(row.nextDueDate) <= 14).length;
  const subscriptionCount = applyBillFilter(rows, 'subscriptions').length;

  return (
    <div className="screen-scaffold bills-screen">
      <Panel className="screen-scaffold__hero" tone="accent" padding="lg">
        <div className="screen-scaffold__hero-actions">
          <div>
            <h2>Bills</h2>
            <p>
              Compare recurring obligations, filter for what matters, and keep selection in the center
              while details stay in the inspector.
            </p>
          </div>

          <div className="screen-inline-actions">
            <Button variant="primary" onClick={() => dispatch(appActions.openEditor('bill-create'))}>
              Add Bill
            </Button>
            <Button
              onClick={() => dispatch(appActions.openEditor('payment-create'))}
              disabled={selectedBill === null}
            >
              Add Payment
            </Button>
            <Button
              onClick={() => dispatch(appActions.openEditor('bill-edit'))}
              disabled={selectedBill === null}
            >
              Edit Bill
            </Button>
          </div>
        </div>
      </Panel>

      {editingState.kind === 'bill-create' || editingState.kind === 'bill-edit' ? <BillEditorPanel /> : null}
      {editingState.kind === 'payment-create' || editingState.kind === 'payment-edit' ? (
        <PaymentEditorPanel />
      ) : null}

      <div className="bills-summary-strip" role="list" aria-label="Bills quick counts">
        <Panel className="bills-summary-card" tone="surface" padding="md" role="listitem">
          <span className="bills-summary-card__label">Visible bills</span>
          <strong className="bills-summary-card__value">{visibleRows.length}</strong>
          <span className="bills-summary-card__meta">{rows.length} total in canonical state</span>
        </Panel>
        <Panel className="bills-summary-card" tone="surface" padding="md" role="listitem">
          <span className="bills-summary-card__label">Due soon</span>
          <strong className="bills-summary-card__value">{dueSoonCount}</strong>
          <span className="bills-summary-card__meta">inside 14 days</span>
        </Panel>
        <Panel className="bills-summary-card" tone="surface" padding="md" role="listitem">
          <span className="bills-summary-card__label">AutoPay</span>
          <strong className="bills-summary-card__value">{autopayCount}</strong>
          <span className="bills-summary-card__meta">automation-enabled bills</span>
        </Panel>
        <Panel className="bills-summary-card" tone="surface" padding="md" role="listitem">
          <span className="bills-summary-card__label">Subscription-like</span>
          <strong className="bills-summary-card__value">{subscriptionCount}</strong>
          <span className="bills-summary-card__meta">detected by recurring pattern/category</span>
        </Panel>
        <Panel className="bills-summary-card" tone="surface" padding="md" role="listitem">
          <span className="bills-summary-card__label">Annual</span>
          <strong className="bills-summary-card__value">{annualCount}</strong>
          <span className="bills-summary-card__meta">annual renewal pressure</span>
        </Panel>
      </div>

      <Panel className="bills-workspace" tone="surface" padding="lg">
        <div className="screen-panel__header bills-workspace__header">
          <div>
            <h3>Recurring bill comparison</h3>
            <p className="screen-panel__caption">
              Search, sort, and saved filters stay in the workspace. Deep bill details stay in the inspector.
            </p>
          </div>
        </div>

        <div className="bills-controls">
          <label className="bills-search-field">
            <span className="bills-search-field__label">Search bills</span>
            <input
              className="editor-input"
              type="search"
              placeholder="Search name, category, frequency, status, renewal"
              value={searchQuery}
              onChange={(event) => dispatch(appActions.setBillsSearchQuery(event.target.value))}
            />
          </label>

          <label className="bills-sort-field">
            <span className="bills-search-field__label">Sort by</span>
            <select className="editor-input" value={sortKey} onChange={(event) => dispatch(appActions.setBillsSort(event.target.value as BillSortKey))}>
              {SORT_OPTIONS.map((option) => (
                <option key={option.key} value={option.key}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="bills-filter-row" role="tablist" aria-label="Saved bill filters">
          {FILTER_OPTIONS.map((option) => (
            <button
              key={option.key}
              type="button"
              className="bills-filter-chip"
              data-active={String(option.key === activeFilter)}
              onClick={() => dispatch(appActions.setBillsFilter(option.key))}
            >
              {option.label}
            </button>
          ))}
        </div>

        {rows.length === 0 ? (
          <div className="screen-empty-state">
            <p>No recurring bills yet.</p>
            <p>Add a bill first. This screen only becomes useful once canonical bill ownership exists.</p>
          </div>
        ) : visibleRows.length === 0 ? (
          <div className="screen-empty-state">
            <p>No bills match the current search/filter combination.</p>
            <p>Clear the search or switch filters. The canonical data is still intact.</p>
          </div>
        ) : (
          <div className="bills-table-shell">
            <div className="bills-table" role="table" aria-label="Recurring bills comparison table">
              <div className="bills-table__header" role="rowgroup">
                <div className="bills-table__row bills-table__row--head" role="row">
                  <span role="columnheader">Bill</span>
                  <span role="columnheader">Category</span>
                  <span role="columnheader">Expected</span>
                  <span role="columnheader">Actual</span>
                  <span role="columnheader">Frequency</span>
                  <span role="columnheader">Next due</span>
                  <span role="columnheader">Status</span>
                  <span role="columnheader">AutoPay</span>
                  <span role="columnheader">Renewal</span>
                </div>
              </div>

              <div className="bills-table__body" role="rowgroup">
                {visibleRows.map((row) => {
                  const isSelected = selectedBill?.id === row.id;

                  return (
                    <button
                      key={row.id}
                      type="button"
                      className="bills-table__row bills-table__row--body"
                      data-selected={String(isSelected)}
                      onClick={() => dispatch(appActions.selectBill(row.id))}
                      role="row"
                    >
                      <span className="bills-table__cell bills-table__cell--primary" role="cell">
                        <strong>{row.name}</strong>
                        <span className="bills-table__subline">{row.priority} · {row.classification}</span>
                      </span>
                      <span className="bills-table__cell" role="cell">{row.category}</span>
                      <span className="bills-table__cell bills-table__cell--numeric" role="cell">
                        {formatCurrency(row.expectedAmount)}
                      </span>
                      <span className="bills-table__cell bills-table__cell--numeric" role="cell">
                        {formatCurrency(row.actualAmount)}
                        <span className="bills-table__subline">Unpaid {formatCurrency(row.unpaidAmount)}</span>
                      </span>
                      <span className="bills-table__cell" role="cell">{row.frequency}</span>
                      <span className="bills-table__cell" role="cell">{row.nextDueDate}</span>
                      <span className="bills-table__cell" role="cell">
                        <span className="bills-status-pill" data-status={row.statusLabel.toLowerCase().replace(/\s+/g, '-')}>
                          {row.statusLabel}
                        </span>
                      </span>
                      <span className="bills-table__cell" role="cell">{row.autopayEnabled ? 'On' : 'Off'}</span>
                      <span className="bills-table__cell" role="cell">{row.renewalLabel}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </Panel>
    </div>
  );
}

function daysUntil(dateValue: string) {
  const target = new Date(`${dateValue}T00:00:00`);
  const today = new Date();
  const todayAnchor = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const difference = target.getTime() - todayAnchor.getTime();
  return Math.ceil(difference / (1000 * 60 * 60 * 24));
}
