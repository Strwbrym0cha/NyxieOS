# Design Review: Phase 2D Cosplay

Phase 2D is accepted overall. The multi-project migration, project/piece editing, mobile project cards, filters, budget estimates, and Make/Buy/Commission workflow all match the approved NyxieOS direction.

## One compatibility bug to fix before Convention

The Home screen still reads legacy compatibility fields and still contains hard-coded cosplay context:

- `data.cosplay.progress` can become stale after piece status changes because detail/list progress is derived from current piece readiness while the compatibility progress field is not always recomputed.
- Home still hard-codes `Galaxy Con · due Sep 18`.
- Home still hard-codes `Next: Jacket · In progress`.

This means the Cosplay module can correctly show a different active project or changed piece readiness while Home may display stale progress/event/next-piece information.

## Required correction

Home should derive its Current Cosplay card directly from `cosplay.activeId` + `cosplay.projects[]` (or from one shared helper/selectors used by both Home and Cosplay) rather than relying on mutable root compatibility fields.

Home should dynamically show:
- active project name
- piece-derived readiness/progress where pieces exist
- target event/date from the active project
- nearest unfinished piece / next action

Keep the existing Home visual design unchanged.

## Other notes

- The Phase 2D commit changed fresh-install Money defaults for `workWindows` and `upcoming` back to empty arrays. Existing persisted data is preserved, so this is not blocking. Add good empty states during later polish rather than restoring fake financial data.
- Final artwork/reference-image handling remains intentionally deferred.

Once the Home compatibility issue is corrected, Phase 2D can be considered fully locked and Convention work can begin.
