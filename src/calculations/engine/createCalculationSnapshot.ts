import type { PaymentRecord, RecurringBill } from '@/domain';
import type { AppState } from '@/store/state';
import {
  addMonths,
  daysBetween,
  isWithinMonth,
  parseIsoDate,
  startOfMonth,
  toMonthKey,
} from '@/calculations/engine/dateMath';
import { annualMultiplierForFrequency, monthlyEquivalentForFrequency } from '@/calculations/engine/frequency';
import type {
  AnnualizedCostTotal,
  CalculationContext,
  CalculationSnapshot,
  CategoryTotal,
  ExpectedVsActualDelta,
  ForecastMonthSummary,
  RecentBillChange,
  RenewalTimingSummary,
  VariableCategoryTrendSummary,
} from '@/calculations/engine/types';

function getBills(state: AppState) {
  return state.entities.bills.allIds
    .map((id) => state.entities.bills.byId[id])
    .filter((bill): bill is RecurringBill => Boolean(bill));
}

function getPayments(state: AppState) {
  return state.entities.payments.allIds
    .map((id) => state.entities.payments.byId[id])
    .filter((payment): payment is PaymentRecord => Boolean(payment));
}

function getActiveBills(state: AppState) {
  return getBills(state).filter((bill) => bill.state === 'active');
}

function getPaymentsForBill(payments: PaymentRecord[], billId: string) {
  return payments.filter((payment) => payment.billId === billId);
}

function getActualAmountForBillCycle(bill: RecurringBill, payments: PaymentRecord[], monthAnchor: Date) {
  const paymentsThisMonth = payments.filter((payment) => isWithinMonth(parseIsoDate(payment.paymentDate), monthAnchor));
  const paymentTotal = paymentsThisMonth.reduce((sum, payment) => sum + payment.amount, 0);
  return bill.currentCycleActualAmount ?? paymentTotal;
}

function buildCategoryTotals(bills: RecurringBill[], payments: PaymentRecord[], monthAnchor: Date): CategoryTotal[] {
  const totals = new Map<string, CategoryTotal>();

  for (const bill of bills) {
    const actualAmount = getActualAmountForBillCycle(bill, getPaymentsForBill(payments, bill.id), monthAnchor);
    const unpaidAmount = Math.max(bill.expectedAmount - actualAmount, 0);
    const existing = totals.get(bill.category) ?? {
      category: bill.category,
      expectedAmount: 0,
      actualAmount: 0,
      unpaidAmount: 0,
      billCount: 0,
    };

    existing.expectedAmount += bill.expectedAmount;
    existing.actualAmount += actualAmount;
    existing.unpaidAmount += unpaidAmount;
    existing.billCount += 1;
    totals.set(bill.category, existing);
  }

  return [...totals.values()].sort((left, right) => right.expectedAmount - left.expectedAmount);
}

function buildAnnualizedCostTotals(bills: RecurringBill[]): AnnualizedCostTotal[] {
  return bills
    .map((bill) => ({
      billId: bill.id,
      billName: bill.name,
      annualizedExpectedAmount: bill.expectedAmount * annualMultiplierForFrequency(bill.frequency),
    }))
    .sort((left, right) => right.annualizedExpectedAmount - left.annualizedExpectedAmount);
}

function buildExpectedVsActualDeltas(
  bills: RecurringBill[],
  payments: PaymentRecord[],
  monthAnchor: Date,
): ExpectedVsActualDelta[] {
  return bills
    .map((bill) => {
      const actualAmount = getActualAmountForBillCycle(bill, getPaymentsForBill(payments, bill.id), monthAnchor);
      return {
        billId: bill.id,
        billName: bill.name,
        expectedAmount: bill.expectedAmount,
        actualAmount,
        deltaAmount: actualAmount - bill.expectedAmount,
      };
    })
    .sort((left, right) => Math.abs(right.deltaAmount) - Math.abs(left.deltaAmount));
}

function buildRenewalTimingLogic(bills: RecurringBill[], now: Date): RenewalTimingSummary[] {
  return bills
    .filter((bill) => Boolean(bill.renewalBehavior))
    .map((bill) => {
      const dueDate = parseIsoDate(bill.nextDueDate);
      return {
        billId: bill.id,
        billName: bill.name,
        renewalBehavior: bill.renewalBehavior ?? 'unspecified',
        nextDueDate: bill.nextDueDate,
        daysUntilRenewal: daysBetween(dueDate, now),
      };
    })
    .sort((left, right) => left.daysUntilRenewal - right.daysUntilRenewal);
}

function buildForecast(
  bills: RecurringBill[],
  state: AppState,
  monthAnchor: Date,
): ForecastMonthSummary[] {
  const horizon = state.forecastSettings.forecastHorizonMonths;
  const monthlyIncome = state.forecastSettings.monthlyIncomeAssumption ?? null;
  const includeVariable = state.forecastSettings.includeVariableEstimates;

  const monthlyEquivalentObligation = bills.reduce((sum, bill) => {
    if (!includeVariable && bill.classification === 'variable') {
      return sum;
    }
    return sum + bill.expectedAmount * monthlyEquivalentForFrequency(bill.frequency);
  }, 0);

  return Array.from({ length: horizon }, (_, index) => {
    const targetMonth = addMonths(monthAnchor, index);
    const projectedIncome = monthlyIncome ?? 0;
    const projectedRemainingCash = monthlyIncome == null ? null : monthlyIncome - monthlyEquivalentObligation;

    return {
      monthKey: toMonthKey(targetMonth),
      expectedObligations: Number(monthlyEquivalentObligation.toFixed(2)),
      projectedIncome,
      projectedRemainingCash: projectedRemainingCash == null ? null : Number(projectedRemainingCash.toFixed(2)),
    };
  });
}

function buildRecentChangeDetection(bills: RecurringBill[], payments: PaymentRecord[]): RecentBillChange[] {
  const changes: RecentBillChange[] = [];

  for (const bill of bills) {
    const billPayments = getPaymentsForBill(payments, bill.id)
      .slice()
      .sort((left, right) => right.paymentDate.localeCompare(left.paymentDate));

    if (billPayments.length < 2) {
      continue;
    }

    const [latest, previous] = billPayments;
    if (latest.amount === previous.amount) {
      continue;
    }

    changes.push({
      billId: bill.id,
      billName: bill.name,
      previousAmount: previous.amount,
      latestAmount: latest.amount,
      deltaAmount: latest.amount - previous.amount,
      changedOn: latest.paymentDate,
    });
  }

  return changes.sort((left, right) => Math.abs(right.deltaAmount) - Math.abs(left.deltaAmount));
}

function buildVariableCategoryTrendReadiness(
  bills: RecurringBill[],
  payments: PaymentRecord[],
): VariableCategoryTrendSummary[] {
  const variableBills = bills.filter((bill) => bill.classification === 'variable');
  const byCategory = new Map<string, Map<string, number>>();

  for (const bill of variableBills) {
    const categoryMap = byCategory.get(bill.category) ?? new Map<string, number>();
    for (const payment of getPaymentsForBill(payments, bill.id)) {
      const monthKey = payment.paymentDate.slice(0, 7);
      categoryMap.set(monthKey, (categoryMap.get(monthKey) ?? 0) + payment.amount);
    }
    byCategory.set(bill.category, categoryMap);
  }

  return [...byCategory.entries()]
    .map(([category, totalsByMonth]) => {
      const entries = [...totalsByMonth.entries()].sort(([left], [right]) => left.localeCompare(right));
      const amounts = entries.map(([, amount]) => amount);
      const monthlyAverage = amounts.length === 0 ? 0 : amounts.reduce((sum, value) => sum + value, 0) / amounts.length;
      const latest = entries.length > 0 ? entries[entries.length - 1] : undefined;

      return {
        category,
        monthlyAverage: Number(monthlyAverage.toFixed(2)),
        latestMonthAmount: latest?.[1] ?? 0,
        monthCount: entries.length,
        latestMonthKey: latest?.[0] ?? null,
      };
    })
    .sort((left, right) => right.monthlyAverage - left.monthlyAverage);
}

export function createCalculationSnapshot(context: CalculationContext): CalculationSnapshot {
  const { now, state } = context;
  const activeBills = getActiveBills(state);
  const payments = getPayments(state);
  const monthAnchor = startOfMonth(now);
  const currentMonthPayments = payments.filter((payment) =>
    isWithinMonth(parseIsoDate(payment.paymentDate), monthAnchor),
  );

  const totalDueThisMonth = activeBills.reduce((sum, bill) => {
    const dueDate = parseIsoDate(bill.nextDueDate);
    return isWithinMonth(dueDate, monthAnchor) ? sum + bill.expectedAmount : sum;
  }, 0);

  const totalPaidThisMonth = currentMonthPayments.reduce((sum, payment) => sum + payment.amount, 0);

  const unpaidTotalThisCycle = activeBills.reduce((sum, bill) => {
    const actualAmount = getActualAmountForBillCycle(bill, getPaymentsForBill(payments, bill.id), monthAnchor);
    return sum + Math.max(bill.expectedAmount - actualAmount, 0);
  }, 0);

  const fixedTotal = activeBills
    .filter((bill) => bill.classification === 'fixed')
    .reduce((sum, bill) => sum + bill.expectedAmount, 0);

  const variableTotal = activeBills
    .filter((bill) => bill.classification === 'variable')
    .reduce((sum, bill) => sum + bill.expectedAmount, 0);

  const essentialTotal = activeBills
    .filter((bill) => bill.priority === 'essential')
    .reduce((sum, bill) => sum + bill.expectedAmount, 0);

  const optionalTotal = activeBills
    .filter((bill) => bill.priority === 'optional')
    .reduce((sum, bill) => sum + bill.expectedAmount, 0);

  const categoryTotals = buildCategoryTotals(activeBills, payments, monthAnchor);
  const annualizedCostTotals = buildAnnualizedCostTotals(activeBills);
  const nextDueLogic = activeBills
    .map((bill) => {
      const dueDate = parseIsoDate(bill.nextDueDate);
      const actualAmount = getActualAmountForBillCycle(bill, getPaymentsForBill(payments, bill.id), monthAnchor);
      return {
        billId: bill.id,
        billName: bill.name,
        dueDate: bill.nextDueDate,
        daysUntilDue: daysBetween(dueDate, now),
        expectedAmount: bill.expectedAmount,
        actualAmount,
        unpaidAmount: Math.max(bill.expectedAmount - actualAmount, 0),
      };
    })
    .sort((left, right) => left.daysUntilDue - right.daysUntilDue);
  const renewalTimingLogic = buildRenewalTimingLogic(activeBills, now);
  const expectedVsActualDeltas = buildExpectedVsActualDeltas(activeBills, payments, monthAnchor);
  const shortRangeCashFlowForecast = buildForecast(activeBills, state, monthAnchor);
  const nextMonthObligationProjection = shortRangeCashFlowForecast[1]?.expectedObligations ?? shortRangeCashFlowForecast[0]?.expectedObligations ?? 0;
  const endOfMonthBalanceProjection = state.forecastSettings.monthlyIncomeAssumption == null
    ? null
    : Number((state.forecastSettings.monthlyIncomeAssumption - totalDueThisMonth).toFixed(2));
  const recentChangeDetection = buildRecentChangeDetection(activeBills, payments);
  const variableCategoryTrendReadiness = buildVariableCategoryTrendReadiness(activeBills, payments);

  return {
    generatedAt: now.toISOString(),
    totalDueThisMonth: Number(totalDueThisMonth.toFixed(2)),
    totalPaidThisMonth: Number(totalPaidThisMonth.toFixed(2)),
    unpaidTotalThisCycle: Number(unpaidTotalThisCycle.toFixed(2)),
    fixedTotal: Number(fixedTotal.toFixed(2)),
    variableTotal: Number(variableTotal.toFixed(2)),
    essentialTotal: Number(essentialTotal.toFixed(2)),
    optionalTotal: Number(optionalTotal.toFixed(2)),
    categoryTotals,
    annualizedCostTotals,
    nextDueLogic,
    renewalTimingLogic,
    expectedVsActualDeltas,
    shortRangeCashFlowForecast,
    nextMonthObligationProjection: Number(nextMonthObligationProjection.toFixed(2)),
    endOfMonthBalanceProjection,
    recentChangeDetection,
    variableCategoryTrendReadiness,
  };
}
