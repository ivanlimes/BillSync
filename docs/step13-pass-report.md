# Step 13 — Cross-screen wiring and synchronization

## Frozen base
- Step 12 settings build

## Controlled change layer
- Cross-screen wiring and synchronization only

## What changed
- Added shared UI-state ownership for the Bills workspace search, filter, and sort controls so navigation and preference changes do not fork into stale local screen state.
- Added explicit cross-screen navigation actions for opening the Bills workspace with a selected bill and the correct edit context.
- Fixed inspector quick actions so Edit Bill, Add Payment, and payment-history edit all navigate into Bills before opening editors.
- Added destination-aware editor cleanup so hidden editors do not remain logically open when the user leaves their owning screen.
- Applied default sort/filter preference changes to the active Bills workspace state where appropriate.
- Updated representative test state to match the shared UI-state contract.

## Real issues surfaced
1. Inspector quick actions were opening editors without routing into the owning workspace, which made the edit state true while the UI stayed invisible.
2. Bills sort/filter state lived in local component state, so Settings changes and navigation could leave the app in a stale forked view.
3. The representative calculation scenario still used the pre-Step-13 UI shape and failed TypeScript build verification once shared Bills workspace state was added.

## Regression checks
- Dashboard bill selection can route into Bills without losing selected-bill context.
- Bills search/filter/sort now persist through navigation and respond to updated default preferences.
- Forecast edits still remain forecast-owned and do not leak into other screens.
- Calendar agenda actions still route timing items into Bills for management.
- Inspector actions now open visible edit flows in the correct workspace.
- Destination changes close incompatible hidden editors instead of leaving stale edit state behind.
- No extra top-level destinations were created.
- No reminder infrastructure, bank sync, collaboration plumbing, or visual refinement leaked into this pass.

## Build verification
- `npm install` completed successfully
- `npm run build` completed successfully
