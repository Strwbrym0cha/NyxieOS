# Phase 2E — Convention Implementation Brief

## Scope

Implement the Convention module described in `docs/CONVENTION_DESIGN_SPEC.md` without redesigning the already-approved Home, Plan, Money, or Cosplay modules.

The only Home change allowed is replacing hard-coded Coming Up convention context with real convention data.

---

## Required data migration/defaults

Add a safe persisted top-level structure:

```js
conventions: {
  activeId: null,
  items: []
}
```

Existing `nyxie-data` without `conventions` must continue loading safely.

Seed one sample convention only if needed to demonstrate the module. Sample data should remain generic and editable.

Each convention should support enough structure for:

- identity/date/location
- linked cosplay IDs
- budget estimate
- schedule
- custom prep checklist
- packing list
- milestone completion state
- lightweight content target/items
- daily Con Day state
- notes / emergency note

Keep data structures straightforward. This is still a localStorage prototype.

---

## Required module navigation

`More` → `Conventions`

Opening Convention should not add a sixth bottom-nav button.

While inside Convention, the bottom navigation should still visually associate the user with `More`.

Provide a clear Back path to More or convention list as appropriate.

---

## Required screens/states

### Convention list

- header
- `+ New Convention`
- upcoming convention cards
- completed convention cards after upcoming
- dynamic countdown
- linked cosplay count/readiness summary
- compact empty state

### Convention create/edit

Support fields from the design spec and linked-cosplay selection.

Use actual `cosplay.projects[]` IDs.

### Convention detail

Use compact mobile sections/tabs:

- Overview
- Schedule
- Prep
- Con Day

### Overview

Implement:

- countdown hero
- date/location/venue
- linked cosplay readiness
- prep/readiness summary
- budget estimate
- notes/emergency note where present

### Schedule

Implement:

- selected convention day if multi-day
- chronological vertical entries
- add/edit schedule entry
- type, time, location, notes
- next-up derivation

### Prep

Implement:

- derived countdown milestone checklist
- persisted milestone completion state
- custom checklist items
- packing items
- quick add for checklist and packing
- categories as defined in design spec

### Content

Content may appear within Prep or Overview if that keeps the phone UI simpler.

At minimum support:

- TikTok target
- completed count
- simple content ideas/items

Do not implement Creator HQ pipeline stages.

### Con Day

Implement a simplified view that derives from the same convention data:

- current convention/day
- current linked cosplay selection
- next schedule item for today
- TikTok progress
- next photoshoot if available
- `Ate something` daily check
- `Water check` daily check
- compact quick actions

Daily checks should be stored per local convention date/day when practical.

---

## Countdown milestone behavior

Use days until convention start to determine which milestone set is currently relevant.

A simple helper is preferred, for example:

```js
getConventionPhase(convention, today)
getConventionMilestones(convention, today)
```

The displayed milestone group should advance automatically with time.

Persist completion by stable milestone IDs so checked items do not reset unnecessarily.

Contacts, shoes, and props must exist in the 14-day milestone set.

Do not create a recurring task engine.

---

## Shared selectors/helpers

Prefer small shared helpers for:

- active/selected convention
- countdown text / days remaining
- convention phase
- linked cosplay projects
- linked cosplay readiness
- prep completion
- next schedule entry
- next photoshoot
- nearest upcoming convention for Home

Reuse existing cosplay selectors rather than reimplementing piece readiness differently.

---

## Home compatibility

Replace hard-coded Home `Coming Up` convention information with the nearest upcoming convention from `conventions.items[]`.

Do not change Home hierarchy, spacing, typography, or card styling.

If no upcoming convention exists, show a safe compact fallback rather than crashing.

---

## Money safety

Do not modify Money data when:

- creating a convention
- entering a budget estimate
- adding packing items
- linking cosplay

Convention budget is planning data only.

---

## Validation

Validate dates and numeric budget fields enough to avoid `NaN`, broken date math, or crashes.

End date should not silently precede start date. Either prevent it or normalize/communicate clearly.

Missing optional fields must be safe.

---

## Mobile checks

Verify at roughly 360px width:

- no horizontal scroll
- convention cards fit one column
- segmented/tabs do not overflow unusably
- schedule rows wrap safely
- forms fit viewport
- packing/checklist rows remain tappable
- Con Day remains short and scannable
- bottom nav does not cover content

---

## Accessibility

Use:

- semantic buttons
- labeled form controls
- actual checkbox controls for checklist/packing/wellness checks where appropriate
- text labels for status, not color alone
- readable contrast

---

## Do not add

- Travel module
- Creator HQ full pipeline
- push notifications
- external calendar sync
- maps
- AI
- automatic Money transactions
- social/relationship data
- vendor messaging
- ticket purchasing

---

## Final verification report

When complete, report:

- files changed
- conventions data model/default migration
- list/create/edit behavior
- Overview behavior
- countdown milestone behavior
- Schedule behavior
- Prep/packing behavior
- Con Day behavior
- Home Coming Up compatibility
- Cosplay link behavior
- Money isolation
- mobile/accessibility verification
- build/test result or exact environment limitation
- commit SHA after push to `main`

Stop after Phase 2E.
