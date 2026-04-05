# Step 6 — Shared UI Primitives and Tokens

## Frozen base
- family-monthly-bills_shell_v05

## Controlled change layer
- shared UI primitives
- token wiring
- spacing/typography/radius/color consistency
- text wrapping and padding hardening

## What changed
- expanded the theme layer to include color tokens and named spacing tokens
- expanded typography tokens beyond family-only into reusable sizes, line heights, and weights
- upgraded the theme contract so tokens have a real typed home
- upgraded shared UI primitives:
  - `Button`
  - `Panel`
  - `PlaceholderBlock`
- rewired shell and placeholder screens to use primitive-backed surfaces instead of raw one-off panel styling
- replaced most raw shell spacing/color values with CSS custom properties aligned to token ownership
- added wrap-safe text behavior and panel content rules so long strings do not drift out of panels
- added denser and accent surface variants for future vertical slices without introducing polish scope creep

## No-touch list honored
- no editing flow logic
- no dashboard metrics UI
- no chart visuals
- no reminder infrastructure
- no bank sync
- no shared-household collaboration plumbing
- no cozy/background personalization behavior
- no visual refinement pass creep

## Real issue surfaced
The project already had token files, but they were mostly symbolic. The live shell still used direct values for spacing, color, and content padding. That would have caused token drift and panel-edge crowding in later slices. This pass corrected that before Step 7 and the vertical slices.

## Regression checklist
1. Shared primitives now have a clear home.
2. Tokens/theme now have a clear home with color, spacing, typography, and radius ownership.
3. Text no longer sits too close to panel edges in the shell placeholders.
4. Long text is constrained with wrap-safe rules.
5. No extra top-level destinations were created.
6. Bills and Forecast naming remains intact.
7. No shell architecture drift occurred.
8. No editing, reminders, charts, or polish leaked into this pass.
9. The structure remains compatible with the locked implementation order.
10. One stable version only.
