# NyxieOS Convention Design Spec v0.1

## 1. Purpose

Convention should feel like Nyxie's magical mission board for a con: one phone-friendly place to answer:

1. How long until the convention?
2. What still needs to be prepared?
3. Which cosplays are going?
4. What is happening today / next?
5. What content, food/water, and money details matter while she is there?

This is not a generic event planner. It is a convention command center for a cosplayer/creator.

---

## 2. Product principles

- mobile first, 360–430px
- short stacked cards
- one-thumb navigation
- important information before deep detail
- link to existing Cosplay data instead of duplicating cosplay projects
- money shown as estimates/context only unless Nyxie explicitly logs money in Money
- no People/Social CRM
- no relationship features
- no green or orange accents
- no desktop schedule grids

Visual direction: magical pink guild mission / quest-board energy, modern and readable. Fairy Tail may inspire the adventure/guild feeling only. Do not copy copyrighted characters, logos, symbols, or UI.

---

## 3. Navigation

Convention lives under `More`.

Tapping the Conventions card opens the Convention module while the bottom navigation still visually treats `More` as the active primary area.

Convention module views:

- Convention list
- Convention detail
- Con Day

Inside Convention detail, use a compact segmented control or equivalent mobile tabs:

- Overview
- Schedule
- Prep
- Con Day

Avoid seven tiny tabs for every possible category.

---

## 4. Convention data model

Use a top-level collection such as:

```js
conventions: {
  activeId: null,
  items: []
}
```

Each convention should support at least:

- `id`
- `name`
- `venue`
- `location`
- `startDate`
- `endDate`
- `status` (`Planning`, `Upcoming`, `In Progress`, `Completed`)
- `notes`
- `cosplayIds[]`
- `budgetTarget` or `budgetEstimate`
- `schedule[]`
- `packing[]`
- `content`
- `checklistState`
- `conDayState`
- optional `emergencyNote`

Do not require every optional field.

---

## 5. Convention list

### Header

`Conventions`

Primary action:

`+ New Convention`

### Cards

Each convention card should feel like a compact guild mission card.

Show:

- convention name
- date range
- location or venue if available
- countdown (`18 days`, `Today`, `2 days left`, etc.)
- status
- linked cosplay count
- prep/readiness summary

Sort upcoming conventions before completed conventions.

Tapping a card opens detail.

Useful empty state:

`No missions on the board yet ✨`

---

## 6. Convention create/edit

Fields:

- name
- venue
- location
- start date
- end date
- status
- optional budget target/estimate
- notes
- optional emergency note

Linked cosplays should be selectable from existing `cosplay.projects[]`.

Do not copy full cosplay data into the convention. Store project IDs.

---

## 7. Overview

### Countdown hero

This is the strongest element on Convention detail.

Example:

`ANIME CONCLAVE`

`18 DAYS`

`Aug 29–31 · New Orleans`

Use pink/plum/lavender fantasy styling without excessive decoration.

### Linked Cosplays

Show selected cosplay cards compactly with:

- cosplay name
- readiness/progress
- next unfinished piece if relevant

Use the existing shared cosplay readiness helpers/selectors where possible.

### Prep status

Show a compact percentage/count based on checklist + packing readiness.

Example:

`Prep 67%`

`8 of 12 ready`

### Budget estimate

Show convention budget/estimate if entered.

This is planning context only.

Do NOT automatically modify Money balances or create transactions.

### Key info

Compact cards/rows for:

- venue/location
- dates
- notes
- emergency note if entered

Do not build the full Travel module here.

---

## 8. Countdown checklist

Nyxie wants a checklist that changes as the convention gets closer.

Implement a lightweight derived milestone system rather than a large recurring-task engine.

Suggested milestone groups:

### 90+ days
- choose main cosplays
- estimate convention budget
- identify long-lead commissions/orders

### 60 days
- order or commission major pieces
- confirm hotel/travel details if applicable

### 30 days
- check cosplay progress
- confirm photoshoots/content ideas

### 14 days
- confirm contacts
- confirm shoes
- confirm props
- test full cosplay

### 7 days
- start packing
- charge/prepare tech
- confirm schedule

### 2 days
- final cosplay check
- pack essentials
- download/save confirmations

### Con day
- food
- water
- current cosplay
- next photoshoot/event
- content goal

The visible milestone section should be derived from days-until-start and advance automatically as time passes.

Persist completion state for milestone items per convention.

The exact starter items can be adjusted, but contacts, shoes, and props must be represented because those are common last-minute misses.

---

## 9. Prep

Prep combines the practical pre-con tools so the phone UI does not become a maze.

### Checklist

Include the active countdown milestone items and custom checklist items.

Custom checklist item fields:

- title
- optional due date
- done
- category

Suggested categories:

- Cosplay
- Travel
- Content
- Money
- General

### Packing

Packing belongs inside Convention Prep for now.

Packing item fields:

- title
- category
- packed
- optional linked cosplay ID

Suggested categories:

- Cosplay
- Beauty
- Tech
- Essentials
- Other

Allow quick-add.

Do not build a reusable global packing-template engine in this phase. That can come with Travel later.

---

## 10. Schedule

Convention schedule should be vertical and chronological.

Schedule entry fields:

- title
- date
- time
- type
- location
- notes

Suggested types:

- Photoshoot
- Panel
- Meetup
- Performance
- Travel
- Other

Do not use a tiny desktop calendar grid.

For a selected day, show events in time order.

Highlight the next upcoming item without relying on color alone.

---

## 11. Content plan

Keep content lightweight inside Convention, because Creator HQ is a later module.

Convention content should support:

- TikTok target count
- TikToks completed
- simple content ideas/items
- photoshoots primarily represented through Schedule entries

A content item may support:

- title/idea
- done
- optional cosplay ID

Do not build editing/posting pipeline stages here. That belongs to Creator HQ.

---

## 12. Con Day mode

Con Day is a simplified survival screen, not the full Convention detail page.

It should surface only the things Nyxie needs while actively at the convention.

### Top

Convention name + current date/day of con.

### Current Cosplay

Allow selecting one of the convention's linked cosplays as today's/current cosplay.

Show:

- cosplay name
- readiness warning only if useful

### Next Up

Dynamically show the next schedule entry for today.

Example:

`2:30 PM · Lucy Photoshoot`

### Content

Show:

- TikToks completed / target
- quick increment/decrement or mark-complete interaction
- next photoshoot if one exists

### Food & Water

Simple daily checks:

- Ate something
- Water check

This is a supportive check-in, not a nutrition tracker.

### Quick actions

Possible buttons:

- Schedule
- Packing
- Emergency info
- Change cosplay

Keep the screen short enough to scan while walking around a con.

---

## 13. Home compatibility

Home's `Coming Up` card should stop using hard-coded convention text once Convention data exists.

It should derive the nearest relevant upcoming convention from `conventions.items[]`.

Show only one compact item:

- convention name
- countdown/date context

Do not visually redesign Home.

If no convention exists, Home may fall back to another existing relevant upcoming item or a safe empty state.

---

## 14. Money boundary

Convention may store estimated costs or budget target.

It must NOT automatically:

- subtract from Available Today
- change Life / Con / Fun buckets
- create transactions
- mark bills paid

Actual money movement remains inside Money.

---

## 15. Cosplay boundary

Convention stores linked cosplay IDs only.

Cosplay remains the source of truth for:

- pieces
- readiness/progress
- project costs
- status
- due dates

Convention may display that information through selectors, but should not duplicate it.

---

## 16. Travel boundary

Convention can store basic venue/location and simple travel notes.

Do not build the full Travel module yet.

Flights, hotels, confirmations, reusable packing templates, and post-trip reset will be designed separately in Travel.

---

## 17. Mobile/accessibility

- 360–430px primary target
- one-column layout
- no horizontal overflow
- touch targets around 44px where practical
- semantic buttons, labels, form controls
- no hover-only interaction
- no color-only status meaning
- bottom navigation remains iPhone safe-area aware
- More remains visually active while inside the Convention module
- forms must fit phone width

---

## 18. Hard no's

Do not add:

- social/friend CRM
- relationship features
- full Travel module
- full Creator HQ pipeline
- bank/finance integrations
- automatic Money transactions
- ticket purchasing
- vendor messaging
- map APIs
- push notifications
- AI recommendations
- giant desktop schedule/table UI
- green/orange accent systems

---

## 19. Acceptance criteria

Convention design is successful when:

- multiple conventions persist
- a convention can be created and edited
- upcoming conventions are easy to scan
- countdown is dynamic
- linked cosplays use existing project data
- the countdown checklist advances based on time-to-con
- contacts/shoes/props checks exist in the pre-con flow
- packing works on a phone
- schedule is chronological and phone-friendly
- content target is lightweight and useful
- Con Day shows current cosplay, next schedule item, TikTok progress, and food/water checks
- Home Coming Up can derive the nearest convention
- no Convention action silently changes Money balances
- no cosplay project data is duplicated unnecessarily
- no horizontal overflow around 360px
