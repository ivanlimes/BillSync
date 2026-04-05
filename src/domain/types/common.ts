export type BillId = string;
export type PaymentId = string;
export type IsoDateString = string;

export type BillFrequency = 'monthly' | 'quarterly' | 'semiannual' | 'annual' | 'custom';
export type BillClassification = 'fixed' | 'variable';
export type BillPriority = 'essential' | 'optional';
export type BillState = 'active' | 'archived';
export type PaymentType = 'manual' | 'autopay' | 'refund' | 'adjustment';
export type ThemeMode = 'system' | 'light' | 'dark';
export type DensityMode = 'comfortable' | 'compact';
export type BillSortKey = 'nextDueDate' | 'name' | 'expectedAmount' | 'category';
export type BillFilterKey = 'all' | 'due-soon' | 'subscriptions' | 'annual' | 'autopay';
export type ForecastHorizon = 1 | 2 | 3 | 6 | 12;
export type PayScheduleAssumption = 'monthly' | 'biweekly' | 'weekly' | 'semimonthly' | 'custom';
