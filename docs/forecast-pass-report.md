# Family Monthly Bills — Step 10 Forecast Vertical Slice

## Frozen base
- Step 9 Bills vertical slice

## Controlled change layer
- Forecast vertical slice only

## What changed
- Replaced the placeholder Forecast screen with a real forecast workspace driven by calculation outputs.
- Added forecast summary KPI cards for expected cash remaining, next-month obligations, fixed vs variable impact, and active horizon/pay-schedule context.
- Added a forecast controls area that preserves the explicit Forecast Settings editing pattern while surfacing current assumptions.
- Added a lightweight local what-if preview for variable pressure and income offset without mutating canonical forecast settings or creating saved scenario branches.
- Added a month-by-month forecast output view using calculation-backed obligation and remaining-cash values.
- Added annual obligations preview using annualized calculation output.

## No-touch list upheld
- No debt-app naming reuse
- No Payment Plan destination
- No shell restructure
- No reminder infrastructure
- No bank sync
- No collaboration plumbing
- No visual refinement / glass pass leakage
- No giant scenario lab or saved branch system

## Regression checks
1. Forecast remains the correct destination name.
2. Forecast outputs are calculation-backed.
3. Canonical forecast assumptions remain source truth.
4. What-if preview stays local and unsaved.
5. No extra top-level destinations were created.
6. No shell/styling scope drift beyond screen-necessary layout classes.
7. Text wrapping and panel padding remain token-aligned.
8. Build passes.
