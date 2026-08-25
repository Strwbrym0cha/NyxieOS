# Phase 2E.1 Implementation Notes: Home Coming Up Compatibility

## Purpose
Complete the final Convention-to-Home compatibility link left after Phase 2E.

## Reuse existing selectors
The codebase already has:
- `getNearestConvention(items)`
- `countdown(convention)`

Reuse those helpers or improve them centrally. Do not create a second independent nearest-convention algorithm inside Home.

## Home behavior
Replace the hard-coded Coming Up convention content with data from the nearest relevant persisted convention.

Recommended content hierarchy:
1. Convention name
2. Dynamic countdown or start date
3. Optional venue/location microcopy if available

If there is no upcoming convention:
- show a compact neutral fallback such as `No upcoming conventions yet.`
- do not hide/break the rest of Home

## Selection rules
A convention is eligible if:
- it has a valid start date
- its start date is today or in the future
- it is not Completed

Select the earliest eligible start date.

## Scope
Only change what is required for Home compatibility. Do not redesign Convention, Home, Plan, Money, Cosplay, or More.
