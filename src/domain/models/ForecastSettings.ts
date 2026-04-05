import type { ForecastHorizon, PayScheduleAssumption } from '@/domain/types/common';

export interface ForecastSettings {
  monthlyIncomeAssumption?: number;
  payScheduleAssumption?: PayScheduleAssumption;
  includeVariableEstimates: boolean;
  forecastHorizonMonths: ForecastHorizon;
  scenarioAssumptions?: string[];
}
