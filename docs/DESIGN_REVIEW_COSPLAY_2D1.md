# NyxieOS Design Review — Phase 2D.1

## Status
PASS. The Home/Cosplay compatibility patch is good enough to lock Phase 2D and move forward.

## Verified from commit `9676d7e3da6f2a14121b6df01982007c1fe71fb9`

The patch adds shared helpers for:

- selecting the active cosplay from `cosplay.activeId` + `cosplay.projects[]`
- deriving readiness from piece statuses
- finding the nearest unfinished piece by due date

Home now consumes active-project data rather than relying on the old hard-coded cosplay context.

## Locked product behavior

Home's Current Cosplay card should continue to show only a compact summary:

- active cosplay name
- current readiness/progress
- event/date context
- next unfinished item

Cosplay remains the source of truth for project detail.

## Later cleanup, not a blocker

The current single-file prototype has accumulated old component implementations alongside newer replacements (`Money` / `MoneyNew`, `Cosplay` / `CosplayNew`). That is acceptable for the current prototype but should be cleaned up during a later architecture/refactor pass once the major V1 modules are established.

Do not interrupt module design work for that cleanup yet.
