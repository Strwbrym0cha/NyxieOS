# Phase 2D Implementation Brief — Cosplay

## Goal

Implement `docs/COSPLAY_DESIGN_SPEC.md` without redesigning unrelated screens.

## Required data migration

Current prototype data uses a single cosplay object. Migrate safely to a multi-project structure while preserving:
- cosplay name
- legacy progress value where useful
- existing piece names
- make / buy / commission mode
- costs
- statuses
- due dates
- links/notes when present

A reasonable target shape is:

```js
cosplay: {
  activeId: <id>,
  projects: [ ... ]
}
```

If the implementation uses different names, keep the same semantics.

Old `nyxie-data` must continue loading without crashing or wiping usable cosplay data.

## Main screen

Build:
- header + `+ New Cosplay`
- compact filter chips
- project cards
- useful empty state

At minimum, filters should support a practical subset of:
- All
- Making / In Progress
- Buying
- Ready
- Wishlist

The exact mapping from piece methods to project filters may be simplified. Avoid complex classification logic.

## Project create/edit

Allow creating and editing a project with:
- name
- source
- project state
- target event
- target date
- optional budget target
- optional image/reference URL string
- notes
- active/current designation

Do not require every optional field.

## Project detail

Show:
- project identity
- progress/readiness
- budget summary
- piece list
- nearest unfinished deadline / next action
- project edit action

Progress may be piece-derived. If a legacy progress value exists, preserve compatibility during migration and avoid surprising data loss.

## Pieces

Allow:
- add
- edit
- mark/update status

Required piece fields:
- name
- method: Make / Buy / Commission
- cost
- status
- due date
- link
- notes

Preferred extra fields where clean:
- seller/creator
- ordered
- arrived
- repair needed
- packed/ready
- reference URL

Keep the quick-add path short. Optional fields can live behind expanded editing.

## Piece state rules

Use a small status vocabulary. Example:
- Planning
- In Progress
- Ordered
- Arrived
- Ready
- Repair

Do not create redundant status systems.

## Budget behavior

Cosplay costs are project estimates/planning data.

Do NOT automatically:
- create Money transactions
- subtract from Available Today
- change Life / Con / Fun bucket balances

Cross-module financial linking is out of scope for Phase 2D.

## Home compatibility

Update Home only as required so `Current Cosplay` reads the active project from the new data shape.

Home should continue to show:
- active project name
- progress
- event/date context
- next incomplete item

Do not visually redesign Home.

## Mobile behavior

Verify around 360px:
- no horizontal overflow
- filters wrap or scroll only if intentionally designed and still usable
- forms fit one column
- project cards remain readable
- piece rows do not become tiny tables
- bottom navigation remains usable and safe-area aware

## Accessibility

- semantic buttons for actions
- labeled inputs/selects
- no color-only status communication
- touch-friendly controls
- clear link presentation

## Scope exclusions

Do not build:
- Convention
- Travel
- Creator HQ
- packing
- social/collaborator tracking
- shopping integrations
- image upload backend
- AI
- automatic Money transactions
- new primary navigation

## Final verification

Before completion:
1. Review the diff.
2. Confirm only Cosplay plus minimum Home/data compatibility changed.
3. Confirm legacy data migration path exists.
4. Confirm multiple projects persist.
5. Confirm add/edit project works.
6. Confirm add/edit piece works.
7. Confirm Make / Buy / Commission persists.
8. Confirm costs/status/dates/links/notes persist.
9. Confirm Home reads the active project.
10. Confirm 360px phone layout does not overflow.
11. Run build/tests if environment permits; otherwise report the exact limitation.
12. Commit and push to `main`.

Stop after Phase 2D.
