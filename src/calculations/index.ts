export { CALCULATION_CATALOG } from '@/calculations/contracts/CalculationCatalog';
export { createCalculationSnapshot } from '@/calculations/engine/createCalculationSnapshot';
export type {
  CalculationContext,
  CalculationSnapshot,
  ForecastMonthSummary,
  CategoryTotal,
  AnnualizedCostTotal,
  BillDueSummary,
  RenewalTimingSummary,
  ExpectedVsActualDelta,
  RecentBillChange,
  VariableCategoryTrendSummary,
} from '@/calculations/engine/types';
export { createCalculationSnapshotSelector } from '@/calculations/selectors/createCalculationSnapshotSelector';
export { representativeScenario } from '@/calculations/testing/representativeScenario';
