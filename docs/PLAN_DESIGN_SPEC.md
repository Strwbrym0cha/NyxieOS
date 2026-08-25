# NyxieOS Plan Design Spec v1

## Purpose

Plan is NyxieOS's flexible planning screen. It must help Nyxie answer:

1. What actually has a time today?
2. What just needs to get done sometime today?
3. What is coming later this week/month?

The screen must never turn every task into a rigid time block.

## Core principle

Nyxie prefers knowing what needs to happen without being forced to assign every item a clock time.

Plan therefore has two distinct item types:

- **Scheduled**: events/tasks with an actual time.
- **Anytime**: tasks assigned to a day but with no required time.

These types should look visually different and stay separate in the data model/UI.

## Mobile layout

Primary width: 360–430px.

One-column vertical layout. No dense desktop calendar squeezed onto a phone.

Recommended order:

1. Header
2. Today / Week / Month segmented control
3. Context strip for selected day/period
4. Scheduled section
5. Anytime section
6. Quick add / add action

Bottom navigation remains fixed and safe-area aware.

## Header

Title: `Plan`

Supporting copy can be short and gentle, e.g. `Your day, without the time-block prison.` Do not overdo joke copy in the production UI.

Use the browser/local date, not hard-coded dates.

## Segmented control

Three options:

- Today
- Week
- Month

Default: Today.

The control should feel like one compact pill/segmented control, not three giant buttons.

## Today view

### Selected day strip

Show the selected date clearly, for example:

`Tuesday · Aug 25`

Optional small count summary:

`2 scheduled · 3 anytime`

### Scheduled

Show only items with actual times.

Each row should support:

- time
- title
- optional small category/type indicator
- optional urgent state
- completion only if the item is task-like

Example:

`2:00 PM   Photoshoot`

`7:00 PM   Dance practice`

Use a subtle vertical timeline or time column if it stays clean on a phone.

Do not invent a duration or end time when none exists.

### Anytime Today

This is the most important planning behavior.

Each task should support:

- checkbox
- title
- urgent badge when appropriate
- completed/softened state
- no time displayed unless Nyxie explicitly adds one

Example:

- Edit TikTok
- Buy contacts
- Wash cosplay

Completed tasks remain visible but softened until the day changes or the user chooses to hide them later.

### Add task

The fastest path should add an **Anytime** task.

A secondary option can allow `Add time` so the task becomes Scheduled.

Do not require a time during creation.

## Week view

Week should be a planning overview, not a seven-column desktop calendar.

Use a vertical list of day cards or compact stacked day sections.

Each day should show:

- weekday + date
- count or short preview of scheduled items
- count or short preview of anytime tasks
- urgent/deadline indicator if needed

Tapping a day should select/open that day in the Today-style detail view.

Avoid horizontal scrolling as a requirement for using the core week view.

## Month view

Month should stay lightweight on mobile.

Use a simple month grid only if it remains readable at 360px. Otherwise use a compact calendar grid plus a selected-day agenda below.

Important dates can use small pink/lavender dots or badges.

Do not cram task titles directly into tiny calendar cells.

Selecting a date should reveal that day's Scheduled + Anytime items below or switch to that day view.

## Task data model

Plan needs date-aware persisted data.

Preferred shape for prototype tasks:

```js
{
  id,
  title,
  date: 'YYYY-MM-DD',
  time: null, // null means Anytime
  done: false,
  urgent: false
}
```

A separate events array is acceptable for true calendar events if it keeps the architecture cleaner, for example:

```js
{
  id,
  title,
  date: 'YYYY-MM-DD',
  time: '14:00',
  type: 'event'
}
```

Whatever architecture is chosen, preserve the Scheduled vs Anytime distinction.

Existing Phase 1 tasks without dates must migrate safely. For prototype migration, undated legacy tasks may be assigned to the current local date so they remain visible rather than disappearing.

## Home compatibility

Home's Today card should show tasks for the current local date only after Plan becomes date-aware.

Do not redesign Home during this pass. Only make compatibility changes required by the Plan data model.

## Skipped-task behavior groundwork

Do not build the full routines system yet, but keep task actions compatible with future behavior:

- ask what happened
- move task to tomorrow

For this Plan pass, it is useful to provide a simple `Move to tomorrow` action for an unfinished anytime task if it can be done cleanly.

No shame/streak-loss messaging.

## Visual style

Continue the approved NyxieOS language:

- magical pink fantasy
- Moon Cream background
- white cards
- Guild Pink / Magic Lavender accents
- Spell Plum text
- rounded 18–22px cards
- restrained sparkles
- clear mobile typography

No green or orange accents.

Scheduled rows can use a lavender time rail/dot.
Anytime tasks should feel softer and more checklist-like.
Urgent states should use deeper pink/plum rather than red/orange if possible.

## Interaction and accessibility

- touch targets ~44px where practical
- no hover-only actions
- controls should have labels/accessible names
- clickable cards/buttons should use semantic buttons where practical, not non-focusable sections pretending to be buttons
- no horizontal overflow at 360px
- keyboard interaction should remain sensible on desktop even though phone is primary

## Scope exclusions

Do not build in this pass:

- recurring routines engine
- external calendar sync
- Google Calendar integration
- notifications
- reminders engine
- convention module
- travel module
- drag-and-drop scheduler
- automatic AI scheduling
- rigid time blocking

## Acceptance criteria

Plan is ready when:

- Today / Week / Month switcher works
- Today clearly separates Scheduled from Anytime
- tasks are date-aware
- tasks can exist without a time
- legacy tasks migrate without disappearing/crashing
- adding a task defaults to Anytime
- a time can be added intentionally when desired
- Week is readable on a phone without desktop-style columns
- Month is readable on a phone and does not stuff task text into tiny cells
- Home still works and now shows only current-date tasks
- completed tasks soften rather than instantly vanish in Today
- no major redesign is made to Home, Money, Cosplay, or More
- no green/orange accents are introduced
- the screen remains clean at 360–430px
