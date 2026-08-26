# NyxieOS Wellness Parity Spec

## Purpose
This document is the implementation source of truth for GitHub Issue #15. The goal is to rebuild Wellness to match the original NyxieOS discovery vision while preserving current planner data, mobile UX, Yuu behavior, and local/cloud persistence.

## Product principle
Wellness is optional, supportive, and context-giving. It is not a compliance score.

Never add:
- streak shame
- calorie counting by default
- judgmental weight language
- medical recommendations
- medication/dose advice
- forced body tracking

## Current legacy shape
The existing app may store Wellness as date keys directly under `data.wellness`:
```js
wellness[date] = {
  energy,
  water,      // IMPORTANT: legacy UI labeled this as Water cups
  meals,      // legacy numeric meal count
  sleep,
  movement,
  steps,
  rest,
  note
}
```

This must remain readable.

### Legacy water semantics
Legacy `water` values represent CUPS because the current UI says `Water cups`.
When deriving/migrating into ounce-based water entries, treat:
`legacyWaterOz = max(0, water) * 8`.
Do not reinterpret legacy cup counts as ounces.

### Legacy meal semantics
Legacy `meals` is a count, not named meal records. Preserve that count in normalization/weekly summaries. If a normalized record is persisted later, either keep a `legacyMealCount` field or create clearly synthetic legacy entries without pretending to know Breakfast/Lunch/Dinner labels.

## Preferred modern shape
Exact implementation can differ, but use one canonical Wellness root similar to:
```js
wellness: {
  settings: {
    waterGoalOz: 64,
    showWeight: false,
    showMedication: false,
    showAppointments: true
  },
  days: {
    "YYYY-MM-DD": {
      mood: "",
      energy: "Okay",
      sleep: 0,
      rest: false,
      note: "",
      waterEntries: [
        { id, amountOz, time }
      ],
      legacyWaterOz: 0,
      meals: [
        { id, type, note, time }
      ],
      legacyMealCount: 0,
      movement: false,
      gym: false,
      movementNote: "",
      movementMinutes: 0,
      steps: 0,
      medicationLogs: {}
    }
  },
  goals: [],
  measurements: [],
  medications: [],
  affirmations: [],
  weeklyReflections: {}
}
```

## Migration strategy
Prefer pure normalization helpers over destructive mount-time migrations.

Create `src/wellness-derived.js` with helpers such as:
- `normalizeWellnessRoot(rawWellness)`
- `getWellnessDay(rawWellness, date)`
- `getWaterTotalOz(rawWellness, date)`
- `getMealCount(rawWellness, date)`
- `getWeekDates(anchorDate)`
- `getWeeklyWellnessSummary(rawWellness, anchorDate)`
- `isLowEnergyDay(rawWellness, date)`
- `getWellnessHomeSummary(rawWellness, date)`

Rendering, Home, and Yuu must all use the same normalization logic.

On first Wellness write, it is acceptable to persist the normalized root, but all old date records must be preserved semantically. Never wipe old Wellness dates.

## Navigation / screen structure
Move Wellness out of `MoreModules.jsx` into `src/Wellness.jsx`.

Use a compact segmented or scrollable section control such as:
- Today
- Log
- Week
- Goals

Optional sections such as Measurements and Meds may live under Goals/More or collapsibles. Avoid one endless vertical wall.

# 1. Today Check-In
Today should be the emotional center of Wellness.

Include:
- Mood
- Energy
- Sleep hours
- Rest day
- short note / “How are we doing?”

Mood can be a friendly select/chip set plus optional custom text if simple.
Suggested mood options:
- Great
- Good
- Okay
- Meh
- Rough

Energy:
- High
- Okay
- Low

No score, no red warning state.

# 2. Water Log
Water must be a real event log.

## Quick add
Provide large tap buttons:
- +8 oz
- +12 oz
- +16 oz
- Custom

Each entry stores amount + time. Time can default to current local time but remain editable.

## Daily total
Show:
- total today in oz
- optional goal
- gentle progress bar/ring

Example:
`32 / 64 oz`

Do not say “failed,” “behind,” or similar.

## Entries
List today’s entries with:
- amount
- time
- edit
- delete

Legacy cup data contributes to total using 8 oz per cup.

# 3. Meals
Simple meal logging only.

Meal types:
- Breakfast
- Lunch
- Dinner
- Snack
- Other

Each meal may have:
- type
- optional time
- optional note

No calories/macros by default.
No “good/bad food” language.

Legacy numeric meal counts still contribute to daily/weekly count summaries.

# 4. Movement / Gym / Steps
These are separate concepts.

Track:
- Movement done
- Gym/workout done
- optional movement/workout note
- optional minutes
- Steps

Do not infer one from another.
Do not require a gym day to count as a good day.

# 5. Goals
Lightweight user-authored goals.

Support goal types such as:
- General
- Water
- Movement
- Gym
- Weight
- Custom

Suggested goal fields:
- id
- title
- type
- target/value optional
- unit optional
- active boolean
- note

These are planning goals, not medical recommendations.

# 6. Weight / Measurements
Optional and collapsible.

Default `showWeight` should remain off for new data unless the current app already has a stronger preference.

Dated entries may support:
- weight
- custom measurements `{label, value, unit}`
- note

Do not calculate BMI, healthy ranges, or body judgments.
Do not put weight on Home by default.

# 7. Medication / Vitamins
Optional self-tracking only.

User-created items:
- id
- name
- optional time
- optional notes
- active

Daily logs track taken/not taken.

Do not add:
- dosage recommendations
- drug interactions
- refill advice
- clinical warnings

The feature is only “did I mark this item taken today?”

# 8. Appointments
Do not invent a second appointments database inside Wellness.

Inspect current planner sources first.
If a canonical appointment/event type exists, derive upcoming appointments.
If no canonical appointment model exists yet, render a small extension-point card such as:
`Appointments will appear here when they are linked from Plan.`
with an `Open Plan` CTA if navigation supports it.

Do not create duplicate appointment records just to fill this section.

# 9. Weekly Gentle Check-In
Provide a 7-day context view.

Summary may include:
- water total and/or average
- meals logged/count
- average sleep from days with sleep data
- movement days
- gym days
- steps total/average when present
- mood distribution/most common mood
- energy distribution/most common energy
- rest days

Never use streak framing.
Use copy such as:
- “Here’s what your week looked like.”
- “No judgment, just context.”

Add a weekly reflection stored by week key:
- What felt good?
- What felt hard?
- What do I want to make easier next week?

# 10. Affirmations
Use a local deterministic/static bank.

Default examples should be short and grounded, not fake productivity hype.
Allow custom affirmations if simple.

Suggested behavior:
- one affirmation card per day selected deterministically from local date
- optional custom entries mixed into the bank

No API.

# Low-Energy Mode
This must materially change presentation.

When today’s Energy = Low:
- Today opens in a simplified gentle layout
- priority order: Water → Food → Rest → one tiny care action
- gym, steps, measurements, and bigger goals are visually de-emphasized/collapsed
- show copy such as `Today can be smaller.`
- provide `Show full Wellness` / expand control so no data is inaccessible

Low-energy mode changes priority/presentation only. It must never delete, auto-complete, or hide data permanently.

## Tiny care action
May be a local suggestion such as:
- drink some water
- eat something
- rest for a bit
- stretch
- wash face

Keep suggestions generic and non-medical.

# Home integration
Keep Home short.

Add at most one compact Wellness line/card, for example:
- `Water 32/64 oz · Energy Low`
- `2 meals · Rest day`

Do not show weight/meds by default on Home.
Use shared helpers only.

# Yuu-Kun integration
Yuu stays deterministic/local.

Refactor `yuu-context.js` away from direct `data.wellness?.[date]` assumptions and use shared Wellness helpers.

Yuu should be able to answer:
- “How am I doing today?”
- “How much water have I had?”
- “Did I eat?”
- “How did I sleep?”
- “Did I work out?”
- “I’m low energy.”
- “How was my week?”

When energy is Low, Yuu uses lower-pressure copy.
He may suggest only generic self-care actions, not medical treatment.

# Convention integration
Issue #19 currently keeps lightweight Con Day `water` and `meals` inside `conDay` because full Wellness was not ready.

Do NOT silently merge or migrate Con Day wellness into global Wellness in this pass unless there is a clean, explicit architecture.
Preserve Con Day behavior as convention-specific context for now.
Future integration can link them deliberately.

# Data safety
- All writes through existing `setData`.
- No direct Supabase calls from Wellness or helper modules.
- No Supabase schema changes.
- Preserve localStorage and cloud snapshot behavior.
- Do not reset planner data.

# Visual system
Pink-first magical NyxieOS.

Primary foreground:
- hot pink
- deeper pink
- blush
- cream/white

Lavender/plum:
- background atmosphere only

No green.
No orange.

Use large taps, compact cards, and friendly progress visuals.

# Mobile QA
Verify at 360px, 390px, 430px:
- segmented/section controls usable
- quick water buttons fit/wrap
- long medication/goal names wrap
- meal forms work with keyboard
- weekly summary cards stack
- optional sections collapse cleanly
- no horizontal page overflow
- bottom navigation remains usable

# Acceptance tests
1. Old `wellness[date].water = 4` displays as 32 oz, not 4 oz.
2. Old `meals = 2` still contributes two meals to summaries.
3. Add +12 oz, total increases exactly 12 oz.
4. Edit/delete water entry updates total.
5. Water goal editable and missing goal does not crash.
6. Mood/energy/sleep/rest persist.
7. Movement and Gym remain independent.
8. Meal log supports Breakfast/Lunch/Dinner/Snack/Other.
9. Low Energy materially simplifies Today but Full Wellness remains accessible.
10. Weekly summary uses seven local-calendar dates and avoids UTC drift.
11. Goals CRUD works.
12. Weight/measurements remain optional and hidden/collapsible by default.
13. Medication/vitamin tracking is optional and contains no advice.
14. Appointments do not create duplicate records.
15. Affirmation selection works offline.
16. Home summary remains compact.
17. Yuu water response matches Wellness total exactly.
18. Yuu weekly response uses the same weekly helper.
19. Existing Con Day water/meals remain intact.
20. Refresh local-only preserves new Wellness data.
21. Cloud snapshot architecture remains untouched.
22. `npm install` + `npm run build` pass in CI.

## Definition of done
Issue #15 is complete only when the original Wellness + Energy feature set is present, old numeric Wellness data remains semantically intact, low-energy behavior is meaningful, Yuu/Home use the same derived helpers, and exact-final-SHA Build + Pages workflows succeed.