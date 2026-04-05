# Family Monthly Bills — Step 2 State Pass Report

## Pass scope
Core data/state layer only.

## Frozen base used
- `family-monthly-bills_scaffold_v01`

## Controlled change layer
- canonical state architecture
- normalized entity ownership for bills and payments
- typed mutation surface for future controlled edits
- selector-aware in-memory store wiring

## What changed
- replaced loose array-backed root state with normalized entity ownership:
  - `entities.bills.byId` + `entities.bills.allIds`
  - `entities.payments.byId` + `entities.payments.allIds`
- preserved `ForecastSettings` and `AppPreferences` as raw source-truth objects
- kept UI routing/selection state separate from domain entities
- added typed action creators and reducer paths for:
  - add/update/archive bill
  - add/update/remove payment
  - update forecast settings
  - update preferences
  - set active destination
  - select bill
  - replace state later for persistence rehydration
- added selector-aware store implementation using `useSyncExternalStore` so later Bills/Forecast slices can read canonical state without forcing a state-layer rewrite

## What did not change
- no persistence implementation
- no calculation engine logic
- no shell implementation
- no editing UI workflows
- no reminders
- no charts
- no styling/polish expansion

## Real issue surfaced
The original scaffold used loose top-level arrays for bills and payments. Leaving that in place would likely have forced a state reshape when Bills list selection, payment history lookup, and Forecast dependencies arrived. This pass corrected that early by normalizing canonical ownership now.

## Regression checklist
1. Family-bills product naming retained: yes
2. Bills and Forecast remain the locked destination names: yes
3. Canonical raw facts live in memory without derived totals stored as source truth: yes
4. `RecurringBill`, `PaymentRecord`, `ForecastSettings`, and `AppPreferences` remain distinct ownership areas: yes
5. State/store has a dedicated home and typed mutation boundary: yes
6. Persistence remains deferred to Step 3: yes
7. Calculations remain deferred to Step 4: yes
8. No extra top-level destinations created: yes
9. No shell/styling/polish leakage introduced: yes
10. Output remains one stable state-layer version: yes
