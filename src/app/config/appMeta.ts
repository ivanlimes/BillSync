export const APP_TITLE = 'Family Monthly Bills';

export const APP_DESTINATIONS = [
  { id: 'dashboard', label: 'Dashboard', ownership: 'Household overview and later KPI/cash-flow summary' },
  { id: 'bills', label: 'Bills', ownership: 'Recurring obligation comparison and selected-bill management' },
  { id: 'forecast', label: 'Forecast', ownership: 'Future cash-flow projection and scenario settings' },
  { id: 'calendar', label: 'Calendar', ownership: 'Due, renewal, and payment timing visibility' },
  { id: 'settings', label: 'Settings', ownership: 'App-level preferences and local data controls' },
] as const;

export const APP_STRUCTURE_GROUPS = [
  { name: 'shell', purpose: 'Persistent app-frame ownership reserved for Step 5' },
  { name: 'screens', purpose: 'Destination-level ownership boundaries for later vertical slices' },
  { name: 'domain', purpose: 'Canonical raw object definitions and shared business types' },
  { name: 'store', purpose: 'Canonical state shape and future mutation home' },
  { name: 'persistence', purpose: 'Local-first save/load contracts reserved for Step 3' },
  { name: 'calculations', purpose: 'Derived household-obligation math reserved for Step 4' },
  { name: 'ui/primitives', purpose: 'Reusable controls and patterns reserved for Step 6' },
  { name: 'theme', purpose: 'Tokens and appearance contracts reserved for Step 6/14' },
  { name: 'utils', purpose: 'App-wide helper utilities' },
] as const;
