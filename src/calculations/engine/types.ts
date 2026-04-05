import type { BillId, IsoDateString } from '@/domain';
import type { AppState } from '@/store/state';

export interface CalculationContext {
  now: Date;
  state: AppState;
}

export interface CategoryTotal {
  category: string;
  expectedAmount: number;
  actualAmount: number;
  unpaidAmount: number;
  billCount: number;
}

export interface AnnualizedCostTotal {
  billId: BillId;
  billName: string;
  annualizedExpectedAmount: number;
}

export interface BillDueSummary {
  billId: BillId;
  billName: string;
  dueDate: IsoDateString;
  daysUntilDue: number;
  expectedAmount: number;
  actualAmount: number;
  unpaidAmount: number;
}

export interface RenewalTimingSummary {
  billId: BillId;
  billName: string;
  renewalBehavior: string;
  nextDueDate: IsoDateString;
  daysUntilRenewal: number;
}

export interface ExpectedVsActualDelta {
  billId: BillId;
  billName: string;
  expectedAmount: number;
  actualAmount: number;
  deltaAmount: number;
}

export interface ForecastMonthSummary {
  monthKey: string;
  expectedObligations: number;
  projectedIncome: number;
  projectedRemainingCash: number | null;
}

export interface RecentBillChange {
  billId: BillId;
  billName: string;
  previousAmount: number;
  latestAmount: number;
  deltaAmount: number;
  changedOn: IsoDateString;
}

export interface VariableCategoryTrendSummary {
  category: string;
  monthlyAverage: number;
  latestMonthAmount: number;
  monthCount: number;
  latestMonthKey: string | null;
}

export interface CalculationSnapshot {
  generatedAt: string;
  totalDueThisMonth: number;
  totalPaidThisMonth: number;
  unpaidTotalThisCycle: number;
  fixedTotal: number;
  variableTotal: number;
  essentialTotal: number;
  optionalTotal: number;
  categoryTotals: CategoryTotal[];
  annualizedCostTotals: AnnualizedCostTotal[];
  nextDueLogic: BillDueSummary[];
  renewalTimingLogic: RenewalTimingSummary[];
  expectedVsActualDeltas: ExpectedVsActualDelta[];
  shortRangeCashFlowForecast: ForecastMonthSummary[];
  nextMonthObligationProjection: number;
  endOfMonthBalanceProjection: number | null;
  recentChangeDetection: RecentBillChange[];
  variableCategoryTrendReadiness: VariableCategoryTrendSummary[];
}
