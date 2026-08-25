# Phase 2F Implementation Notes — Travel

## Goal
Implement the approved mobile Travel module from `docs/TRAVEL_DESIGN_SPEC.md` without expanding scope into booking, maps, live flight APIs, or a new primary navigation model.

## Read first
- `AGENTS.md`
- `docs/NYXIEOS_DESIGN_SPEC.md`
- `docs/TRAVEL_DESIGN_SPEC.md`
- `docs/DESIGN_REVIEW_CONVENTION_2E1.md`

## Data migration
Extend the persisted root data safely with:

```js
travel: {
  activeId: null,
  trips: [],
  packingTemplates: []
}
```

Old `nyxie-data` without Travel must continue loading.

Normalize missing arrays/objects enough that malformed or partial prototype Travel data does not crash the screen.

## More navigation
Replace the Travel placeholder under More with a real action that opens Travel.

Do not change the five primary bottom tabs.

## Recommended screen structure
Travel may be implemented with internal view state similar to Convention:

- trip list
- trip detail
- create/edit forms
- detail tabs/sections if helpful

Suggested detail sections:
- Overview
- Flights
- Stay
- Plan
- Packing
- Reset

Avoid a crowded tab strip if it becomes unusable at 360px. A compact segmented control or stacked section navigation is acceptable.

## Trip model
A trip should support at minimum:
- id
- name
- destination
- startDate
- endDate
- status
- linkedConventionId
- budgetEstimate
- notes
- emergencyInfo
- flights
- stays
- transport
- itinerary
- packing
- confirmations
- foodSpots
- postTripReset

## Flight implementation
Flight information is the highest-priority detail.

Support add/edit with:
- airline
- flightNumber
- from
- to
- departureDate
- departureTime
- arrivalTime
- confirmation
- terminalGate
- seat
- notes

Sort flights chronologically.

A prominent flight card should appear near the top of trip detail when flights exist.

## Stay
Support add/edit lodging records with:
- name
- address
- checkInDate/time
- checkOutDate/time
- confirmation
- notes

## Ground transport
Support lightweight transport entries with:
- type
- date
- optional time
- pickup/location
- destination
- confirmation/reference
- notes

## Itinerary
Use vertical chronological rows/cards.

Support:
- date
- optional time
- title
- location
- type
- notes

Untimed items remain valid.

## Packing templates
Provide persisted reusable packing templates.

A minimal V1 can allow:
- creating template items
- adding/copying template items into a trip packing list

Trip packing items should persist independently after being copied.

## Packing
Trip packing item:
- id
- title
- category
- packed

Use semantic checkboxes and quick-add.

## Confirmations
Support small manual reference items:
- label
- value
- notes

These are not secret-management or credential-storage features. Keep them as ordinary trip reference text.

## Food spots
Support simple manual saved places:
- name
- location text
- notes

No external APIs.

## Post-trip reset
Initialize new trips with a small persisted reset checklist such as:
- Unpack
- Laundry
- Review expenses
- Sort/back up content
- Reset travel bag

Users can toggle completion.

## Active-trip emphasis
If current local date is between `startDate` and `endDate`, trip detail may visually emphasize:
- today's/next flight
- lodging address
- next itinerary item

Keep this derived rather than storing duplicated state where possible.

## Convention linking
Trip may store only `linkedConventionId`.

Resolve convention name/context from `conventions.items[]` when rendering.

Do not duplicate Convention schedule, cosplay IDs, prep, packing, or Con Day state into Travel.

## Money isolation
Do not mutate `money` when editing Travel budget, packing, flights, lodging, or confirmations.

## Home compatibility
No Home redesign is required in Phase 2F.

Do not add Travel to Home unless explicitly required by a later design pass.

## Accessibility/mobile checks
- 360px width remains usable
- no horizontal scrolling
- long confirmation/reference text wraps
- inputs have labels
- buttons are touch-friendly
- bottom nav safe area preserved
- More remains active context while inside Travel
- no green/orange accents

## Do not add
- live flight tracking
- maps
- route planner
- weather fetches
- hotel/flight/restaurant booking
- currency tools
- push notifications
- automatic Money transactions
- AI recommendations
- full Convention duplication

## Finish report
Report:
- files changed
- Travel migration/data model
- More navigation
- trip list/create/edit
- flight behavior
- stay/transport behavior
- itinerary behavior
- packing-template and trip-packing behavior
- confirmations/food/reset behavior
- Convention-link behavior
- Money isolation
- mobile/accessibility verification
- build/test result or exact environment limitation
- commit SHA after push

Stop after Phase 2F.
