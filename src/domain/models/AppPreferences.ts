import type { BillFilterKey, BillSortKey, DensityMode, ThemeMode } from '@/domain/types/common';

export interface AppPreferences {
  themeMode: ThemeMode;
  accentPreference: string;
  backgroundPreference: string;
  defaultSort: BillSortKey;
  defaultFilter: BillFilterKey;
  densityMode?: DensityMode;
  reminderDefaults?: string[];
}
