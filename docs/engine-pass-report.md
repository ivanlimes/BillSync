# Family Monthly Bills App — Step 4 Calculation Engine Pass

## Frozen base used
- family-monthly-bills_persistence_v03

## Controlled change layer
- Financial calculation engine only

## What changed
- replaced calculation stubs with a real derived-state engine
- added typed calculation snapshot contracts
- added date/frequency math helpers for recurring-bill projection
- added snapshot selector for calculation access without storing derived values in canonical state
- added representative scenario data for engine verification
- updated the app status surface so the current pass can expose calculation readiness without building screen polish

## Calculation outputs now supported
- total due this month
- total paid this month
- unpaid total this cycle
- fixed total
- variable total
- essential total
- optional total
- category totals
- annualized cost totals
- next due logic
- renewal timing logic
- expected vs actual deltas
- short-range cash-flow forecast
- next-month obligation projection
- end-of-month balance projection
- recent change detection
- variable-category trend readiness

## Guardrails preserved
- no derived values stored as source truth
- no chart visuals added
- no dashboard vertical slice work
- no shell/styling refinement work
- no reminder/shared-household/bank-sync work
- no new top-level destinations

## Real breakage surfaced and resolved
- build verification initially failed because the delivered source zip did not include installed dependencies; package installation was required before TypeScript/Vite validation could complete

## Validation
- npm install: passed
- npm run build: passed
