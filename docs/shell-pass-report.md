Family Monthly Bills — Shell Pass Report (v05)

Step implemented: 5. Shell frame implementation

Change layer:
- one persistent shell only
- top bar
- left navigation
- center workspace frame
- right inspector frame
- destination switching inside stable shell
- placeholder-safe screen ownership only

No-touch confirmation:
- no editing flows
- no dashboard metrics UI beyond placeholders
- no chart visuals
- no reminder infrastructure
- no shared-household plumbing
- no glass/cozy refinement

Regression checklist:
1. family-bills naming retained
2. Bills and Forecast retained as locked destinations
3. top bar, left nav, center workspace, right inspector each have clear ownership
4. center workspace remains dominant
5. inspector does not become a second workspace
6. no fake feature work added early
7. no extra top-level destinations created
8. no styling/polish pass leaked in
9. shell stable across Dashboard, Bills, Forecast, Calendar, Settings
10. one stable output version only

Real issue surfaced:
- the frozen base zip shipped with broken/incomplete node_modules; build verification required deleting node_modules and reinstalling cleanly before npm run build passed.
