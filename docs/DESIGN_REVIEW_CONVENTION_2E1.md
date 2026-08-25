# Design Review — Convention Phase 2E.1

## Status
Accepted for continuation.

Commit reviewed: `5f8e79c8267a003fbc61a258ec6ef65b94d6ecbb`

## What is now correct
- Home `Coming Up` consumes persisted Convention data.
- The nearest eligible convention is selected through the shared `getNearestConvention()` helper.
- Same-day conventions remain eligible.
- Completed and past conventions are excluded.
- Home shows a safe empty state when no upcoming convention exists.
- Hard-coded convention context was removed from Home.

## Note
The reviewed commit also removes an accidental patch marker that had been left in `src/main.jsx`, which is a useful cleanup before the next module.

## Convention status
Convention is now considered complete enough to lock for this design cycle.

Do not reopen Convention during Travel implementation unless a minimal compatibility change is necessary for linking a trip to a convention by ID.
