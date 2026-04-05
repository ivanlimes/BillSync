import type { BillFilterKey, BillSortKey, PaymentRecord, RecurringBill } from '@/domain';
import type { CalculationSnapshot } from '@/calculations/engine/types';

export interface BillTableRow {
  id: string;
  name: string;
  category: string;
  expectedAmount: number;
  actualAmount: number;
  unpaidAmount: number;
  frequency: RecurringBill['frequency'];
  nextDueDate: string;
  statusLabel: string;
  state: RecurringBill['state'];
  autopayEnabled: boolean;
  renewalLabel: string;
  payerLabel: string | null;
  paymentUrl?: string;
  notes?: string;
  classification: RecurringBill['classification'];
  priority: RecurringBill['priority'];
}

export function createBillTableRows(
  bills: RecurringBill[],
  payments: PaymentRecord[],
  snapshot: CalculationSnapshot,
): BillTableRow[] {
  const dueMap = new Map(snapshot.nextDueLogic.map((item) => [item.billId, item]));
  const deltaMap = new Map(snapshot.expectedVsActualDeltas.map((item) => [item.billId, item]));

  return bills.map((bill) => {
    const dueSummary = dueMap.get(bill.id);
    const deltaSummary = deltaMap.get(bill.id);
    const actualAmount = dueSummary?.actualAmount ?? deltaSummary?.actualAmount ?? getActualAmountFromPayments(payments, bill.id);
    const unpaidAmount = dueSummary?.unpaidAmount ?? Math.max(bill.expectedAmount - actualAmount, 0);

    return {
      id: bill.id,
      name: bill.name,
      category: bill.category,
      expectedAmount: bill.expectedAmount,
      actualAmount,
      unpaidAmount,
      frequency: bill.frequency,
      nextDueDate: bill.nextDueDate,
      statusLabel: getStatusLabel(bill.state, unpaidAmount, actualAmount),
      state: bill.state,
      autopayEnabled: bill.autopayEnabled,
      renewalLabel: getRenewalLabel(bill),
      payerLabel: bill.payerLabel ?? null,
      paymentUrl: bill.paymentUrl,
      notes: bill.notes,
      classification: bill.classification,
      priority: bill.priority,
    };
  });
}

function getActualAmountFromPayments(payments: PaymentRecord[], billId: string) {
  return payments.filter((payment) => payment.billId === billId).reduce((sum, payment) => sum + payment.amount, 0);
}

function getStatusLabel(state: RecurringBill['state'], unpaidAmount: number, actualAmount: number) {
  if (state === 'archived') {
    return 'Archived';
  }

  if (actualAmount <= 0) {
    return 'Unpaid';
  }

  if (unpaidAmount > 0) {
    return 'Partially paid';
  }

  return 'Paid';
}

function getRenewalLabel(bill: RecurringBill) {
  if (bill.renewalBehavior && bill.renewalBehavior.trim().length > 0) {
    return bill.renewalBehavior;
  }

  if (bill.frequency === 'annual') {
    return 'Annual renewal';
  }

  if (bill.frequency === 'quarterly' || bill.frequency === 'semiannual') {
    return `${bill.frequency} cycle`;
  }

  return 'Standard cycle';
}

export function applyBillSearch(rows: BillTableRow[], query: string) {
  const normalizedQuery = query.trim().toLowerCase();

  if (normalizedQuery.length === 0) {
    return rows;
  }

  return rows.filter((row) => {
    const haystack = [
      row.name,
      row.category,
      row.frequency,
      row.statusLabel,
      row.renewalLabel,
      row.classification,
      row.priority,
      row.payerLabel ?? '',
    ]
      .join(' ')
      .toLowerCase();

    return haystack.includes(normalizedQuery);
  });
}

export function applyBillFilter(rows: BillTableRow[], filter: BillFilterKey) {
  switch (filter) {
    case 'due-soon':
      return rows.filter((row) => daysUntil(row.nextDueDate) <= 14 && row.state === 'active');
    case 'subscriptions':
      return rows.filter((row) => isSubscriptionRow(row));
    case 'annual':
      return rows.filter((row) => row.frequency === 'annual');
    case 'autopay':
      return rows.filter((row) => row.autopayEnabled);
    case 'all':
    default:
      return rows;
  }
}

export function applyBillSort(rows: BillTableRow[], sortKey: BillSortKey) {
  const sortedRows = [...rows];

  sortedRows.sort((left, right) => {
    switch (sortKey) {
      case 'name':
        return left.name.localeCompare(right.name);
      case 'expectedAmount':
        return right.expectedAmount - left.expectedAmount;
      case 'category':
        return left.category.localeCompare(right.category) || left.name.localeCompare(right.name);
      case 'nextDueDate':
      default:
        return left.nextDueDate.localeCompare(right.nextDueDate) || left.name.localeCompare(right.name);
    }
  });

  return sortedRows;
}

function isSubscriptionRow(row: BillTableRow) {
  const subscriptionSignals = ['subscription', 'streaming', 'membership', 'software', 'internet', 'phone'];
  const haystack = `${row.category} ${row.name} ${row.renewalLabel}`.toLowerCase();
  return subscriptionSignals.some((signal) => haystack.includes(signal));
}

function daysUntil(dateValue: string) {
  const target = new Date(`${dateValue}T00:00:00`);
  const today = new Date();
  const todayAnchor = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const difference = target.getTime() - todayAnchor.getTime();
  return Math.ceil(difference / (1000 * 60 * 60 * 24));
}
