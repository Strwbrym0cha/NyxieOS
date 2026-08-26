# NyxieOS Routines Parity Spec

## Goal
Complete the original Routines vision without turning NyxieOS into a rigid habit tracker. Routines are flexible support systems, not time blocks, streaks, or punishment loops.

This pass should make routines answer four questions clearly:

1. Which routines actually apply today?
2. What is left in this routine today?
3. Can I skip today without breaking anything?
4. What is the smallest version I can do on a low-energy day?

## Product rules
- Mobile-first at 360–430px.
- Pink is the dominant foreground color.
- No green/orange status language.
- No streaks, guilt, grades, or missed-day punishment.
- No forced morning/night routines.
- No rigid time blocks.
- Skipping one day changes only that day.
- Low-energy mode changes presentation and expectations, not recurrence data.
- All writes go through the existing `setData` flow.
- No Supabase schema/auth/storage changes.
- No duplicate routine database.

## Current legacy shape
Existing routines may look like:

```js
{
  id,
  name,
  steps: ["step one", "step two"],
  completion: {
    "2026-08-25": { 0: true, 1: false }
  },
  skipped: {
    "2026-08-25": true
  },
  skipNotes: {
    "2026-08-25": "optional note"
  },
  carryForward: {
    "2026-08-25": true
  }
}
```

This must continue rendering and remain editable.

## Preferred modern routine shape
Exact property names may vary, but support the following concepts:

```js
{
  id,
  name,
  category: "Daily Life",
  active: true,
  recurrence: {
    type: "daily", // daily | weekdays | weekends | selected | manual
    days: [1, 3, 5]
  },
  steps: [
    { id, text, lowEnergy: false }
  ],
  completion: {},
  skipped: {},
  skipNotes: {},
  carryForward: {},
  notes: ""
}
```

Do not require destructive migration. Helpers may normalize old string steps into a safe view model.

## Dedicated module
Move the Routines experience out of `src/MoreModules.jsx` into:

- `src/Routines.jsx`
- `src/routine-derived.js`

Remove the old embedded Routines implementation after routing the dedicated module.

Do not leave two Routine implementations.

## Views
Use a compact mobile structure such as:

- Today
- All

Today is the default.

### Today
Only show routines that:
- are active,
- apply to the selected local date,
- or were explicitly carried forward to that date.

Each card should show:
- name,
- category,
- recurrence summary,
- progress,
- remaining steps,
- skipped state if applicable.

### All
Show every routine with compact filters such as:
- All
- Active
- Paused
- category chips if useful.

Allow create/edit/pause/delete from here.

## Recurrence
Support:

- Daily
- Weekdays
- Weekends
- Selected weekdays
- Manual / only when opened

Use local-calendar weekday logic.

Suggested selected-day UI:
Mon Tue Wed Thu Fri Sat Sun

No cron syntax or advanced scheduler UI.

A routine that does not apply today should not clutter the Today view.

## Categories
Categories are organizational only.

Suggested defaults:
- Daily Life
- Reset
- Work
- Creator
- Convention
- Travel
- Wellness
- Other

Do not let categories create separate data stores or cross-app modes yet.

## Steps
Modern steps should support:
- id
- text
- lowEnergy boolean

Allow:
- add
- edit
- delete
- complete/uncomplete

Reordering is optional for this pass.

Do not create tasks in `data.tasks` for routine steps.
Routine steps remain canonical inside the routine.

## Legacy completion compatibility
Existing completion may be keyed by numeric index.
New completion may be keyed by stable step ID.

`routine-derived.js` must safely read both.

When a legacy routine is edited into modern step objects, old completion history must not disappear.

A safe approach is to preserve a legacy index on normalized steps or keep legacy completion keys readable indefinitely.

## Skip today
Keep the existing optional prompt:

“What happened? (optional)”

Skipping today should:
- mark only the selected local date skipped,
- preserve completion already logged that day,
- preserve recurrence,
- preserve future dates,
- never create shame copy.

Useful copy:
“Skipped for today.”

## Try again tomorrow / carry forward
If a routine is skipped, allow:

“Try tomorrow”

This should create a one-day carry-forward override for tomorrow.

Important:
- it must not rewrite the routine recurrence,
- it must not duplicate the routine,
- if tomorrow already normally applies, it simply remains applicable,
- if tomorrow would not normally apply, carry-forward makes it appear once.

Use local-calendar date math.

## Reset day state
Routine completion is per local date.
A new day naturally starts unchecked without deleting history.

Do not automatically erase old completion maps.

## Low-energy routine mode
This is required.

When Wellness energy for the selected day is Low, Routine Today should offer a simplified version.

Do not auto-edit routine data.

Each modern step can be marked:

`lowEnergy: true`

In low-energy presentation, show only those tiny steps by default.

If a routine has no low-energy steps configured:
- show a gentle note such as “No tiny version set yet.”
- offer “Show full routine”.

Do not silently choose or invent which step is tiny.

Suggested copy:
“Today can be the tiny version.”

The user must always be able to reveal the full routine.

## Progress
Progress should be derived from the routine steps for the selected date.

Example:
4 steps, 2 complete → 2 / 4 complete, 50%.

If skipped:
show skipped state separately.
Do not count skipped as 100% complete.

Low-energy view may show tiny-step progress, but full progress must remain available.

## Shared helpers
Create `src/routine-derived.js` with pure helpers such as:

- `localRoutineDate`
- `shiftRoutineDate`
- `normalizeRoutine`
- `normalizeRoutineStep`
- `routineAppliesToDate`
- `getApplicableRoutines`
- `getRoutineCompletion`
- `isRoutineStepComplete`
- `getRoutineProgress`
- `getRoutineRemainingSteps`
- `getRoutineLowEnergySteps`
- `getRoutineTodaySummary`
- `getRoutineRecurrenceLabel`

Use these helpers in Routines and Yuu. Home may use them later if needed.

## Wellness integration
Use the existing shared Wellness helper to determine whether the selected day is low-energy.

Do not copy Wellness state into routines.

Low-energy status is derived only.

## Yuu-Kun
Refactor Yuu routine context to use `routine-derived.js`.

Yuu should answer accurately:
- “What routines do I have today?”
- “What routine is left?”
- “How far am I in my routine?”
- “Did I skip my routine?”
- “What is the tiny version?”
- “Can I do this tomorrow?”

Keep the existing safe skip action behavior if retained.

No API.
No relationship commentary.
No shame language.
No destructive mass completion.

## Home
Keep Home short.

Do not add a large Routine card in this pass.

A routine cue on Home is optional only if it is one compact line and genuinely useful. Leaving Home unchanged is acceptable.

## Visual
Pink-first NyxieOS.
Cream/white cards.
Lavender/plum background atmosphere only.
No green/orange status system.

Routine cards should feel calm, not like a productivity scoreboard.

Use large tap targets, wrapping step text, compact recurrence chips, and soft progress.

## Mobile QA
Verify at:
- 360px
- 390px
- 430px

Check:
- Today/All switch
- weekday selector
- long routine names
- long step text
- low-energy toggle/view
- edit form keyboard behavior
- skip / try tomorrow controls
- bottom nav safe area
- no horizontal page overflow

## Regression safety
Preserve:
- Issue #12 Cloud Sync
- Issue #13 Yuu
- Issue #14 Planned Needs
- Issue #17 Plan/Home
- Issue #18 Cosplay
- Issue #19 Convention + Con Day
- Issue #15 Wellness
- Issue #20 Creator HQ
- Issue #21 Money + Work

Do not begin:
- Travel polish
- unified Reminders
- cross-app Modes
- final Yuu sprite integration

## Acceptance tests
1. Legacy string-step routine renders safely.
2. Legacy numeric-index completion still displays correctly.
3. Daily routine appears every day.
4. Weekdays routine appears Monday–Friday only.
5. Weekends routine appears Saturday/Sunday only.
6. Selected-days routine appears only on chosen weekdays.
7. Manual routine does not automatically clutter Today.
8. Paused routine does not appear in Today but remains in All.
9. Complete 2 of 4 steps → 50%.
10. Skip today → only today is marked skipped.
11. Existing completed steps remain recorded after skip.
12. Try tomorrow does not change recurrence.
13. Try tomorrow makes a non-scheduled tomorrow routine appear once.
14. Low Wellness energy triggers tiny-version presentation.
15. Only explicitly `lowEnergy` steps appear in tiny view.
16. No configured tiny steps → gentle empty state + Show full routine.
17. Editing a legacy routine does not erase historical completion.
18. Yuu routine answers use the same shared helper math.
19. Refresh local-only preserves recurrence, completion, skip, and carry-forward state.
20. Cloud architecture remains unchanged.

## Build and delivery
Run:
- `npm install`
- `npm run build`

Push to `main`.

Verify exact final SHA:
- Build workflow success
- GitHub Pages workflow success

Stop after the Routines parity issue. Do not begin the next parity pass.