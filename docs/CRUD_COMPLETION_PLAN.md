# NyxieOS CRUD Completion Plan

Issue #10 remains incomplete. Commit `0247e8099220a7e939a022130cbfcc3fe9043ac3` only added shared CRUD action styling and Creator HQ content-item deletion.

## Completion rule
Do not call Issue #10 complete until every section below is implemented and verified.

## Batch A — Tasks + Money
### Tasks / Plan
- Edit task title
- Edit date
- Add/edit/remove time
- Edit urgent state
- Edit completion state
- Delete task with confirmation
- Keep Move to Tomorrow
- Home updates from task mutations

### Money
- Edit Available Today
- Edit Weekly Goal
- Edit Days Remaining if user-managed
- Edit Life / Con / Fun balances
- Edit/delete transactions with aggregate reconciliation
- Edit/delete work windows
- Edit/delete upcoming-money items
- No double-application of transaction effects

## Batch B — Cosplay + Conventions + Travel
### Cosplay
- Edit/delete projects
- Edit/delete pieces
- Deleting active project selects another or null
- Clear dependent Creator cosplayId
- Remove deleted cosplay IDs from Convention linkedCosplayIds

### Conventions
- Edit/delete conventions
- Edit/delete user-managed schedule, custom prep, packing, content/configurable records
- Protect system milestone templates if desired
- Deleting convention clears Travel linkedConventionId and Creator conventionId
- Home Coming Up updates safely

### Travel
- Edit/delete trips
- Edit/delete flights, stays, transport, itinerary, packing items, packing templates, confirmations, food spots, post-trip reset items
- Deleting active trip selects another or null

## Batch C — Wellness + Routines + Final integrity
### Wellness
- Clear current local-date check-in with confirmation

### Routines
- Edit/delete routine
- Add/edit/delete steps
- Preserve per-date completion/skip data where sensible

### Creator HQ
- Keep existing edit/delete content behavior
- Clear stale cosplay/convention references when source records are deleted

### Final integrity and UX
- All deletes require confirmation
- Edit forms prefill existing data
- Save + Cancel on edit forms
- Closing/deleting current editor is safe
- Preserve `nyxie-data` localStorage key
- No destructive migration
- 360/390/430px remain usable
- Magical V3 styling preserved
- No green/orange accents

## Required verification before claiming completion
1. Create -> edit -> refresh -> delete -> refresh for a task.
2. Edit Available Today and all three money buckets.
3. Create/edit/delete earned and spent transactions; aggregates remain correct.
4. Create/edit/delete work window and upcoming-money item.
5. Create/edit/delete cosplay project and piece; Home remains safe.
6. Create/edit/delete convention; Travel/Creator references clear safely.
7. Create/edit/delete trip and each child record type.
8. Creator item edit/delete works.
9. Wellness current day clears safely.
10. Routine and routine-step CRUD works.
11. Build passes.
12. GitHub Actions and Pages remain green.

## Stop condition
Do not stop after partial styling or one module. If environment/tool limitations prevent completion, report the exact blocker and leave Issue #10 explicitly incomplete.
