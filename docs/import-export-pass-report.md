# Import / Export Pass Report

## Goal

Add a narrow spreadsheet import/export path for bill records without reopening the hardened shell, calculation engine, editing flows, or broader persistence model.

## Freeze rule followed

- Frozen base copied before changes.
- Change layer limited to Settings data controls plus one workbook interop utility.
- No reducer shape changes.
- No calculation engine changes.
- No routing or shell ownership changes.
- No mutation of payments, forecast settings, preferences, or other entities during workbook import.

## What changed

### New
- `src/persistence/interop/billWorkbook.ts`
  - exports current bills to an XLSX workbook
  - imports XLSX / XLS / CSV files
  - matches rows by `Bill ID` first, then `Bill Name`
  - updates existing bills or adds new ones
  - preserves payments and non-bill app state
  - returns import summary and row warnings

### Updated
- `src/screens/settings/SettingsScreen.tsx`
  - replaced disabled import placeholder
  - added workbook export button
  - added workbook import picker
  - kept JSON backup export
  - retained reset-local-data control
  - surfaced import rules and warnings in Settings only

- `src/app/styles/shell.css`
  - added minimal styling for import warning list only

- `package.json` / `package-lock.json`
  - added spreadsheet library dependency

## Important implementation choice

The spreadsheet library is lazy-loaded.
That avoids dragging workbook code into the main app bundle on first load.
The initial attempt increased the main bundle too much, so this was corrected before finalizing the pass.

## Import behavior

- accepted file types: `.xlsx`, `.xls`, `.csv`
- import target: bill records only
- match order:
  1. `Bill ID`
  2. `Bill Name` (case-insensitive)
- missing rows do **not** delete existing bills
- invalid rows are skipped and reported back as warnings
- optional blank cells clear optional fields
- required blank cells skip that row

## Regression checks completed

- `npm run build` passes
- lazy-load split confirmed in production build output
- no changes to app schema version
- no changes to calculation engine files
- no changes to reducer action model
- no changes to shell frame ownership

## Known limitation kept on purpose

Workbook import updates bill entities only.
It does not attempt bulk payment import or full JSON restore from spreadsheet data.
That keeps the feature narrow and avoids reopening unrelated layers.

## Dependency risk surfaced

`npm audit --omit=dev` reports one high-severity advisory against the `xlsx` package currently available on npm, with no fix published there at this time.
The implementation now lazy-loads that dependency so it does not inflate the main bundle, but the advisory still exists and should be considered before productionizing or exposing arbitrary untrusted workbook uploads.
