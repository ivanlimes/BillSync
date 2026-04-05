# Bills Vertical Slice — Step 9

## Frozen base used
- `family-monthly-bills_dashboard_v08` as the only implementation base

## Controlled change layer
- Bills destination only
- Comparison/manage workspace only
- Inspector population enrichment only

## What changed
- Added calculation-backed bill table rows with current-cycle expected vs actual ownership
- Added real search, real sort, and real saved filters (`all`, `due-soon`, `subscriptions`, `annual`, `autopay`)
- Replaced the old center-screen duplicate inspector panel with a true comparison table in the workspace
- Kept deep bill details in the right inspector
- Enriched inspector with current-cycle details, reminder-state readout, support facts, payment link readout, and notes

## No-touch list respected
- no reminder infrastructure
- no bank sync
- no shared-household collaboration plumbing
- no new top-level destinations
- no shell redesign
- no glass/cozy refinement pass
- no fake inline spreadsheet editing

## Real issue surfaced
- The previous Bills screen was structurally wrong for Step 9 because it duplicated inspector behavior in the center workspace. That would have created ownership blur and a second workspace problem. Fixed by moving the center screen to a true comparison/manage table and leaving detail depth in the inspector.

## Regression checklist
1. Family-bills naming retained, not debt naming.
2. Bills and Forecast remain the correct destination names.
3. Bills now has clear center-workspace ownership.
4. Inspector still owns selected-bill detail depth.
5. Search, sort, and filter are real, not decorative.
6. Required bill fields are visible in the main comparison table.
7. No extra top-level destinations were created.
8. No reminder/chart/glass/shared-household leakage occurred.
9. Text stays inside tokens and panel/table padding boundaries.
10. Output remains one stable Step 9 artifact only.
