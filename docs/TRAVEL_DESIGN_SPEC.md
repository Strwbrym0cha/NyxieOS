# NyxieOS Travel Design Spec v0.1

## 1. Purpose

Travel is Nyxie's mobile trip command center.

It should answer these questions quickly:

1. What trip am I on / preparing for?
2. Where are my flight details?
3. Where am I staying and how do I get there?
4. What still needs to be packed or handled?
5. What is happening next?
6. What do I need to clean up after I get home?

Travel should feel especially reassuring around flying because flight logistics are a major stress point.

This is not a generic vacation scrapbook and not a full travel-booking product.

---

## 2. Navigation

Travel lives under:

`More → Travel`

Do not add a sixth primary bottom-nav item.

While inside Travel, `More` remains the active primary area.

Provide clear Back navigation.

---

## 3. Mobile hierarchy

Primary target: 360–430px.

Default trip-detail hierarchy:

1. Trip identity / countdown
2. Flight information
3. Stay / address
4. Getting around
5. Today / itinerary
6. Packing
7. Budget / confirmations
8. Food / notes / emergency
9. Post-trip reset

Flight details should be easier to find than any secondary trip information.

Avoid wide itinerary tables and tiny multi-column dashboards.

---

## 4. Travel data model

Use a persisted top-level structure such as:

```js
travel: {
  activeId: null,
  trips: [],
  packingTemplates: []
}
```

Each trip should support:

- id
- name
- destination
- startDate
- endDate
- status
- optional linkedConventionId
- notes
- emergencyInfo
- budgetEstimate
- confirmations / important references
- flights[]
- stays[]
- transport[]
- itinerary[]
- packing[]
- foodSpots[]
- postTripReset

Do not duplicate full Convention objects. If a trip is associated with a convention, store the convention ID.

---

## 5. Trip list

Travel landing screen should include:

- `+ New Trip`
- active/upcoming trips first
- compact trip cards
- destination
- date range
- countdown/status
- optional linked convention name
- useful empty state

A trip card should not show every flight or itinerary item.

---

## 6. Create / edit trip

Support:

- trip name
- destination
- start date
- end date
- status
- optional linked convention
- budget estimate
- notes
- emergency info

Optional fields should not block trip creation.

Statuses can remain simple:

- Planning
- Upcoming
- Traveling
- Complete

---

## 7. Flight-first design

Flights are the most prominent Travel detail.

Each flight should support:

- airline
- flight number
- departure airport
- arrival airport
- departure date
- departure time
- arrival time
- confirmation number
- terminal / gate text
- seat
- notes

### Flight card priority

Show at first glance:

- airline + flight number
- departure airport → arrival airport
- departure date/time
- confirmation number or a very obvious reveal/copy area
- terminal/gate if entered

Provide easy add/edit.

If multiple flights exist, sort chronologically.

Do not integrate with airline APIs in this phase.

---

## 8. Stay / lodging

Each stay can support:

- hotel / lodging name
- address
- check-in date/time
- check-out date/time
- confirmation number
- room / notes

The address should be highly readable and easy to copy manually.

No maps integration in this phase.

---

## 9. Getting around

Keep ground transportation lightweight.

Support entries such as:

- rideshare
- rental car
- personal car
- train
- shuttle
- other

Fields may include:

- type
- date/time
- pickup/location
- destination
- confirmation/reference
- notes

Do not build a route planner.

---

## 10. Itinerary

Use a chronological vertical list.

Each item can support:

- date
- optional time
- title
- location
- type
- notes

Untimed items are allowed.

Do not force every trip activity into a clock time.

If linked to a convention, Convention remains the source of truth for detailed con programming. Travel should not duplicate the full Convention schedule.

---

## 11. Packing

Travel should support both:

### Reusable packing templates
Examples:
- basic toiletries
- tech
- flight essentials
- clothes

### Trip-specific packing
Each trip should have its own persisted packing list.

Packing items should support:
- title
- category
- packed state

Quick-add should be easy on mobile.

Do not merge cosplay inventory into Travel. Convention/Cosplay own cosplay readiness. Travel can contain general packing reminders and may optionally show a linked reminder to check Convention packing.

---

## 12. Budget and confirmations

Trip budget is planning context only.

Support:
- budget estimate
- optional confirmation/reference items

Confirmation items can include:
- label
- value/reference
- notes

Do not automatically create Money transactions or subtract from money buckets.

Money owns actual spending logs.

---

## 13. Food / useful places

Keep this manual and lightweight.

Support saved entries such as:
- restaurant / food spot name
- area/address text
- notes

No maps, restaurant APIs, reservations, or discovery engine in this phase.

---

## 14. Emergency / important info

Provide a compact place for:
- emergency note
- important address
- hotel desk/contact text
- other user-entered emergency information

Do not build a People/Social CRM.

---

## 15. Post-trip reset

Nyxie wants an explicit reset after travel.

Each trip should support a small post-trip checklist with defaults such as:

- unpack
- laundry
- review expenses
- back up / sort content
- reset travel bag

Allow completion to persist.

No shame language if items remain unfinished.

---

## 16. Optional active-trip mode

If the current local date falls inside a trip date range, the trip detail may emphasize:

- today's flight/transport if any
- lodging address
- next itinerary item
- quick access to confirmations

Keep this simple and scannable.

Do not create a new primary nav mode.

---

## 17. Convention integration boundary

Travel may store `linkedConventionId`.

It may display:
- linked convention name
- convention dates/location summary
- button/action to open Convention if navigation architecture supports it cleanly

Do not copy Convention schedules, cosplay arrays, packing lists, or milestone state into Travel.

---

## 18. Money boundary

Travel budget and confirmations are planning data.

Do NOT automatically:
- alter Available Today
- alter Life / Con / Fun balances
- create transactions

---

## 19. Visual direction

Continue NyxieOS visual language:

- magical pink
- lavender
- cream
- plum
- rounded cards
- restrained sparkles
- readable mobile typography

Flight cards may receive stronger visual priority through plum/pink contrast.

No green accents.
No orange accents.

---

## 20. Accessibility / mobile

- one-column phone layout
- no horizontal overflow around 360px
- touch targets ~44px where practical
- semantic buttons and labels
- readable confirmation numbers / references
- no hover-only controls
- safe-area bottom navigation preserved
- no color-only status communication

---

## 21. Explicit exclusions

Do not add:
- airline APIs
- live flight tracking
- maps
- route planning
- hotel booking
- restaurant booking
- weather API
- currency conversion
- bank integration
- automatic Money transactions
- social/relationship tracking
- AI travel recommendations
- push notifications

---

## 22. Phase acceptance criteria

Travel is acceptable when:

- multiple trips persist
- `More → Travel` works
- trip create/edit works
- flight information is visually prominent and easy to edit/find
- stays and transport can be stored
- itinerary is chronological and mobile-friendly
- untimed itinerary items are allowed
- reusable packing templates exist
- trip-specific packing persists
- budget/confirmation references persist
- post-trip reset persists
- optional convention link uses convention IDs
- Travel does not duplicate Convention or Cosplay source-of-truth data
- Travel does not modify Money balances automatically
- layout remains clean around 360px
- no green/orange accents appear
