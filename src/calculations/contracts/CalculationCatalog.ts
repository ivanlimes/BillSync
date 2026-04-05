export const CALCULATION_CATALOG = [
  'totalDueThisMonth',
  'totalPaidThisMonth',
  'unpaidTotalThisCycle',
  'fixedTotal',
  'variableTotal',
  'essentialTotal',
  'optionalTotal',
  'categoryTotals',
  'annualizedCostTotals',
  'nextDueLogic',
  'renewalTimingLogic',
  'expectedVsActualDeltas',
  'shortRangeCashFlowForecast',
  'nextMonthObligationProjection',
  'endOfMonthBalanceProjection',
  'recentChangeDetection',
  'variableCategoryTrendReadiness',
] as const;

export type CalculationKey = (typeof CALCULATION_CATALOG)[number];
