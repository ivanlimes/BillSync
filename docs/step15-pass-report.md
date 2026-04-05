# Step 15 — Regression pass and V1 hardening

## Frozen base
- family-monthly-bills_refinement_v14.zip

## Scope
Regression and hardening only.
No new feature surfaces.
No screen-map expansion.
No shell redesign.

## What was checked
1. schema/state integrity
2. editing-flow stability
3. cross-screen synchronization
4. sort/filter persistence behavior
5. forecast and timing sanity
6. dense-readability and panel-boundary safety
7. persistence reload safety
8. backdrop safety on dense surfaces
9. constrained-width shell behavior at the source/CSS level
10. build integrity from a clean install

## Real issues found and fixed
### 1) stale persisted selection could survive hydration
Hydrated UI state could retain a selected bill or selected payment ID even when the entity no longer existed.
That created hidden invalid state after reload.

Fix:
- sanitize UI selection on `state/replace`
- clear invalid selected bill/payment references
- downgrade invalid edit modes back to `none`

### 2) editor state could drift when bill selection changed
Selecting a different bill while a bill-edit or payment editor was open could silently repoint the editor at a different bill.
That is structurally unsafe.

Fix:
- close bill-bound editors on bill-selection changes
- keep selection change explicit instead of mutating editor context underneath the user

### 3) selected payment state could remain stale after payment removal or editor close
Removed or closed payment editing could leave stale selected-payment state behind.

Fix:
- clear selected payment on payment removal when relevant
- clear selected payment on editor close

## Regression result
- canonical raw facts remain the only source truth
- Bills and Forecast remain the locked destination names
- no extra top-level destinations were created
- no reminder infrastructure, bank sync, or collaboration plumbing leaked in
- dense surfaces remain flatter and readable after Step 14 refinement
- persisted reload state is safer against orphaned selection/editing references
- build passes from clean install

## Build verification
- clean `npm install` completed successfully
- `npm run build` completed successfully

## Result
V1 hardened artifact prepared.
