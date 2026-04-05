# Family Monthly Bills — Step 12 Settings vertical slice

## Frozen base
- Input artifact: `family-monthly-bills_calendar_v11.zip`
- This pass adds **Settings vertical slice only**.

## Scope kept
- Appearance preferences
- Behavior defaults
- Local data controls

## Scope rejected
- Reminder infrastructure
- Shared-household collaboration plumbing
- Bank sync
- Workflow logic from Bills / Forecast
- Glass/cozy refinement beyond app-level shell backdrop preference hooks

## What changed
- Replaced placeholder Settings content with a real app-level settings surface
- Added appearance controls for:
  - theme mode
  - accent preference
  - shell backdrop preference
  - density mode
- Applied appearance preferences at the shell level only via app-level data attributes
- Added behavior default controls for:
  - default bill sort
  - default bill filter
  - reminder defaults storage
- Added local data controls for:
  - export local data JSON
  - reset local data to initial canonical baseline
  - import/restore placeholder kept intentionally deferred
- Tightened spacing/wrapping rules for settings cards, controls, and summaries so text does not crowd edges or drift outside token boundaries
- Corrected stale top-bar copy so the shell no longer claims the app is still in the primitives pass

## Real issue surfaced
- The frozen base again shipped with a broken packaged install state. Build validation required a clean dependency install before TypeScript and Vite could verify the source tree.

## Regression checklist
1. Settings remains app-level only: **pass**
2. No extra top-level destinations created: **pass**
3. No Bills/Forecast workflow logic dumped into Settings: **pass**
4. Background personalization remains shell-only: **pass**
5. Dense working surfaces remain opaque/readable: **pass**
6. Reminder defaults stored without building reminder infrastructure: **pass**
7. Local data controls remain narrow and local-first: **pass**
8. No glass/cozy refinement leakage beyond preference hooks: **pass**
9. Text and controls keep clean token-backed padding: **pass**
10. Output is one stable version artifact only: **pass**

## Build verification
- `npm install` completed successfully
- `npm run build` completed successfully
