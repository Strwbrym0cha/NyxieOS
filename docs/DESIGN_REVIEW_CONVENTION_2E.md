# Design Review: Convention Phase 2E

## Status
Phase 2E is accepted for the Convention module itself.

Commit reviewed: `0cd603fa3b7cf4dc9e5bfdaa6ce8287b017531bc`

## What is working
- persisted `conventions.activeId` + `conventions.items`
- Convention accessible under More
- list/create/edit flows
- linked cosplay IDs rather than duplicated projects
- Overview / Schedule / Prep / Con Day structure
- time-relative milestone checklist
- 14-day contacts / shoes / props milestone
- packing and custom prep
- chronological schedule
- Con Day food/water/content context
- Money isolation

## Required follow-up before next module
Home's `Coming Up` card still needs to consume the nearest persisted upcoming convention dynamically.

The Phase 2E commit already includes a `getNearestConvention` helper and countdown helper, so the follow-up should reuse those rather than inventing a parallel selection rule.

### Home should show
- nearest relevant upcoming convention name
- dynamic countdown or date context
- optional location/venue context if compact
- safe fallback when there is no upcoming convention

### Behavior
- creating an earlier upcoming convention should immediately change Home
- editing a convention start date should immediately reorder Home's selection
- marking a convention Completed should remove it from Home eligibility
- deleting/removing all convention data must not crash Home

Do not visually redesign Home during this compatibility patch.
