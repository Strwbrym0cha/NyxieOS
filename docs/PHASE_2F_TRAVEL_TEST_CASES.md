# Phase 2F Travel Manual Test Cases

## Migration
1. Load old localStorage with no `travel` key.
2. App loads without crashing.
3. Travel shows a safe empty state.

## Trip creation
1. Create a trip with only required fields.
2. Save.
3. Refresh.
4. Trip remains.

## Flights
1. Add two flights in reverse chronological order.
2. Return to trip detail.
3. Flights display chronologically.
4. Confirmation, terminal/gate, seat, and notes remain after refresh.

## Stay and transport
1. Add a hotel stay with address and confirmation.
2. Add a rideshare/shuttle/rental entry.
3. Refresh.
4. Both remain readable on a narrow phone layout.

## Itinerary
1. Add a timed itinerary item.
2. Add an untimed itinerary item.
3. Both remain valid.
4. Vertical ordering remains readable.

## Packing templates
1. Add a reusable template item.
2. Add/copy it into a trip packing list.
3. Toggle the trip copy packed.
4. Template and trip copy remain independent.

## Convention link
1. Link a trip to an existing convention.
2. Rename the convention.
3. Travel reflects the current convention name through the linked ID.
4. Travel does not duplicate the old convention name as source-of-truth data.

## Money isolation
1. Record Money balances.
2. Edit trip budget, flights, lodging, and packing.
3. Confirm Money balances/transactions are unchanged.

## Post-trip reset
1. Toggle reset items.
2. Refresh.
3. Completion persists.

## Mobile
At approximately 360px width verify:
- no horizontal page scroll
- flight details wrap cleanly
- confirmation text wraps
- forms fit viewport
- bottom nav does not cover content
- controls are tappable
