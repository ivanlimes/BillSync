import type { ForecastHorizon, ForecastSettings, PayScheduleAssumption } from '@/domain';

export interface ForecastFormValues {
  monthlyIncomeAssumption: string;
  payScheduleAssumption: PayScheduleAssumption;
  includeVariableEstimates: boolean;
  forecastHorizonMonths: ForecastHorizon;
}

export function getForecastFormValues(settings: ForecastSettings): ForecastFormValues {
  return {
    monthlyIncomeAssumption:
      settings.monthlyIncomeAssumption === undefined ? '' : String(settings.monthlyIncomeAssumption),
    payScheduleAssumption: settings.payScheduleAssumption ?? 'monthly',
    includeVariableEstimates: settings.includeVariableEstimates,
    forecastHorizonMonths: settings.forecastHorizonMonths,
  };
}

export function validateForecastForm(values: ForecastFormValues) {
  const errors: Partial<Record<keyof ForecastFormValues, string>> = {};

  if (values.monthlyIncomeAssumption.trim().length > 0) {
    const amount = Number(values.monthlyIncomeAssumption);

    if (!Number.isFinite(amount) || amount < 0) {
      errors.monthlyIncomeAssumption = 'Monthly income must be 0 or greater.';
    }
  }

  return errors;
}
