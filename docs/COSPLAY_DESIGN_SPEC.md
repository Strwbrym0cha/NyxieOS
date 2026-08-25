# NyxieOS Cosplay Design Spec v0.1

## 1. Purpose

Cosplay is one of NyxieOS's five core V1 features and should feel like a magical project inventory rather than a generic to-do list.

The screen exists to answer:

1. What cosplays am I working on?
2. What pieces does each cosplay still need?
3. Am I making, buying, or commissioning each piece?
4. How much is each piece / the whole cosplay costing?
5. What needs to happen next, and by when?

Nyxie's real planning flow is:

`Choose cosplay → list every piece → determine cost → choose make/buy/commission → set timeline/deadlines → get it ready for the event.`

The design should make that flow obvious on a phone.

---

## 2. Mobile-first principles

Primary target: 360–430px.

Use:
- one-column layout
- stacked project cards
- compact filter chips
- large tap targets
- detail screens/panels instead of stuffing every field into the project list
- no horizontal scrolling for core use
- no desktop inventory table

The cosplay screen can contain more depth than Home, but it should still feel navigable with one hand.

---

## 3. Visual direction

Continue the approved NyxieOS language:
- magical pink
- lavender / blush / cream / plum
- anime/fantasy energy without copying copyrighted characters, logos, or UI
- rounded cards
- decorative stars/sparkles used as accents
- polished but not cluttered

Cosplay may lean slightly more “magical inventory / project grimoire” than the other screens.

No green accents.
No orange accents.

For status differences, use pink/plum/lavender intensity, neutrals, icons, text labels, or patterns rather than green/orange status colors.

---

## 4. Main Cosplay screen

### Header
Title: `Cosplay`
Suggested microcopy: `Build it piece by piece ✨`

Primary action:
`+ New Cosplay`

### Filter row
Compact chips:
- All
- Making
- Buying
- Ready
- Wishlist

A cosplay may have an overall project state such as:
- Wishlist
- Planning
- In Progress
- Ready
- Archived

The filter wording may map to those states in the simplest sensible way. Do not overengineer taxonomy.

### Project cards
Each cosplay card should show only enough to decide whether to open it:

- image/thumbnail placeholder
- cosplay/character name
- source/anime/game if provided
- target convention/event if provided
- progress percentage
- remaining-piece count
- nearest relevant deadline or days remaining
- overall state/status

Example:

**Lucy Heartfilia**
`Fairy Tail · Anime Conclave`
`72% ready · 3 pieces left`
`Next: Contacts · buy by Sep 3`

Tap opens the project detail.

Do not show every piece on the main list.

---

## 5. New / edit cosplay

Keep the form compact and mobile-friendly.

Minimum fields:
- name / character
- source
- project state
- target convention/event
- target date
- optional image/reference URL or placeholder reference field
- optional notes

Helpful project-level fields:
- budget target
- active/current flag

The active/current cosplay is the one Home should surface by default.

Do not require every optional field before the project can exist.

---

## 6. Cosplay project detail

This is the heart of the module.

Recommended hierarchy:

1. Project hero / identity
2. Progress + readiness summary
3. Budget summary
4. Pieces
5. References / notes

### Project hero
Show:
- thumbnail/reference placeholder
- cosplay name
- source
- target convention/date
- overall state
- Edit action

### Progress
Show a clear `ProgressSpell` or equivalent.

Progress should be understandable from piece readiness. A simple prototype rule is acceptable, such as:
- ready/complete pieces count toward completion
- unfinished pieces do not

If the implementation needs to preserve legacy manual progress, migrate safely and move toward piece-derived progress without losing data.

Also show:
- total pieces
- ready pieces
- remaining pieces
- nearest unfinished deadline

### Budget summary
Show compact values:
- planned/estimated total
- actual/entered cost total if available
- optional budget target
- remaining against budget target if set

Do not build a full accounting system inside Cosplay.

---

## 7. Pieces

Pieces are the primary project-management unit.

Each piece must support at least:
- name
- method: Make / Buy / Commission
- cost
- status
- due date
- link
- notes

Strongly preferred additional fields because they match Nyxie's needs:
- seller / creator
- ordered state
- arrived state
- repair needed
- packed / ready state
- optional reference URL

### Status options
Use a small practical set, for example:
- Planning
- In Progress
- Ordered
- Arrived
- Ready
- Repair

Do not create twelve overlapping statuses.

### Piece card / row
Collapsed row should show:
- piece name
- method chip
- status
- cost
- due date when present

Tap expands or opens editing details.

### Add piece
Primary action inside the project:
`+ Add Piece`

Adding a piece should be fast.

Suggested quick form:
- name
- Make / Buy / Commission
- cost
- due date

Then allow optional details to be edited afterward.

---

## 8. Make / Buy / Commission UX

This distinction is important enough to be visually obvious.

Use compact segmented/chip selection.

### Make
Useful optional details:
- materials/notes
- progress/status

### Buy
Useful optional details:
- store/seller
- link
- ordered
- arrived

### Commission
Useful optional details:
- creator
- link/contact reference
- commissioned/ordered state
- expected completion/arrival

Do not build vendor messaging or external commerce integrations.

---

## 9. Deadlines + next action

NyxieOS should help answer “what do I need to deal with next?”

Project detail should surface one compact next-action area based on the nearest unfinished piece deadline where practical.

Examples:
- `Buy contacts by Sep 3`
- `Finish prop paint by Sep 6`
- `Commission deadline in 4 days`

Do not turn this into AI scheduling.

---

## 10. Home compatibility

Home's `Current Cosplay` card should use the active/current cosplay from the new cosplay collection.

Home should show only:
- active cosplay name
- progress
- target event/date context
- next one or two unfinished/urgent pieces

Do not visually redesign Home during the Cosplay phase.

If no cosplay is active, Home may show a compact empty state or omit project detail gracefully.

---

## 11. Money compatibility

Cosplay pieces contain costs, but Phase 2D should NOT automatically create Money transactions or alter Con/Fun balances when pieces are edited.

That cross-module behavior can be designed later if Nyxie actually wants it.

For now:
- Cosplay owns estimated/project piece costs.
- Money owns actual money logs and balances.

Avoid hidden double-counting.

---

## 12. Data direction

Move away from the single legacy `cosplay` object toward a collection such as:

```js
cosplay: {
  activeId: 1,
  projects: [
    {
      id: 1,
      name: '...',
      source: '...',
      state: 'In Progress',
      targetEvent: '...',
      targetDate: 'YYYY-MM-DD',
      budget: 0,
      image: '',
      notes: '',
      pieces: []
    }
  ]
}
```

Exact naming may vary if the existing architecture benefits from another clean shape.

Migration must preserve the existing single prototype cosplay and its pieces.

Do not delete a user's existing cosplay data simply because the shape changes.

---

## 13. Empty states

If there are no projects:

`No cosplays yet ✨`
`Start with the character living rent-free in your head.`

Primary action:
`Create a cosplay`

If a project has no pieces:

`Nothing listed yet.`
`Add the pieces you need to make, buy, or commission.`

Keep empty states brief and useful.

---

## 14. Accessibility

- Buttons should be actual buttons where practical.
- Form controls need labels.
- Avoid color-only status communication.
- Touch targets should be about 44px where practical.
- Text must remain readable on a 360px screen.
- Links should be clearly distinguishable when present.

---

## 15. Explicit exclusions for Phase 2D

Do not add:
- convention module
- packing system
- content creator pipeline
- vendor messaging
- automatic purchasing
- shopping APIs
- image upload/backend storage
- AI cosplay recommendations
- automatic budget transactions into Money
- social/collaborator CRM
- drag-and-drop boards
- repair inventory system beyond a simple piece status/flag

Keep this phase focused on cosplay project planning.

---

## 16. Acceptance criteria

The Cosplay redesign is acceptable when:

- multiple cosplay projects can exist and persist
- legacy single-cosplay data migrates safely
- one project can be marked active/current
- the main screen shows compact project cards
- filtering is useful on a phone
- a project can be created and edited
- a project detail view exists
- pieces can be added and edited
- Make / Buy / Commission is explicit
- piece cost, status, due date, link, and notes are supported
- project progress/readiness is understandable
- budget summary is compact and useful
- nearest unfinished deadline/next action is surfaced
- Home can read the active cosplay without a redesign
- no Money balances are silently changed from cosplay edits
- layout remains clean around 360px
- no green/orange accents appear
