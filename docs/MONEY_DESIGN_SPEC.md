# NyxieOS Money Design Spec v0.1

## 1. Purpose

Money is one of NyxieOS's highest-priority daily-use areas. It should answer four questions quickly:

1. How much money can I use today?
2. How much have I made toward my weekly goal?
3. How much do I still need to make?
4. What money thing needs my attention next?

The Money screen should feel motivating and clear, not like accounting software.

Nyxie primarily does self-paced gig work and wants money goals without turning work tracking into a giant timesheet.

---

## 2. Mobile-first hierarchy

Primary width: 360–430px.

Default Money screen order:

1. Header
2. Available Today hero
3. Money buckets
4. Weekly Money Mission
5. Quick Log
6. Good Work Window
7. Upcoming Money

Use one vertical column. Avoid dense tables and tiny spreadsheet-style controls.

---

## 3. Visual direction

Money should feel a little more powerful than the rest of NyxieOS while staying within the approved magical-pink system.

Use:
- Spell Plum for strong hero surfaces
- Guild Pink for action emphasis
- Fairy Blush / Magic Lavender for secondary cards
- Moon Cream / White for ordinary surfaces

No green or orange semantic states. Success/progress can use brighter pink, lavender, plum, or neutral contrast.

Large numbers must remain highly readable.

---

## 4. Header

Title: `Money`

Optional microcopy:
`Make the week work for you.`

Do not add a giant decorative header that pushes useful data below the fold.

---

## 5. Available Today hero

This is actual money Nyxie can spend/use today. It is NOT the amount she needs to earn toward her weekly mission.

Show:
- label: `Available today`
- large currency number
- small edit affordance
- optional note such as `Your usable money for today`

Example:
`$114.32`

For the prototype, this value may be manually edited and persisted.

Do not silently recalculate it from the weekly earning mission.

---

## 6. Money buckets

Nyxie wanted money separated into simple mental buckets:

- Life
- Con
- Fun

These should be compact, phone-friendly cards or chips with balances.

Example:
- Life `$72`
- Con `$28`
- Fun `$14`

Tapping a bucket may filter recent money activity or open a lightweight bucket detail state.

Do not build a complicated zero-based-budgeting engine.

The buckets are for clarity, not financial punishment.

---

## 7. Weekly Money Mission

This is the core earning-goal card.

Show:
- weekly goal
- weekly earned
- remaining
- days remaining
- suggested amount per remaining day
- earned today
- progress indicator

Example:
- Goal `$1,000`
- Earned `$620`
- Remaining `$380`
- 4 days left
- Suggested `$95/day`
- Earned today `$63`

Primary action:
`Log earnings`

Secondary action:
`Edit goal`

The card should feel encouraging and action-oriented rather than judgmental.

Avoid aggressive streaks or red failure states.

---

## 8. Quick Log

Nyxie should not need to dig through forms to update money.

Provide two clear actions:

- `+ Earned`
- `− Spent`

### Log earnings
Capture only what is needed:
- amount
- source: Gig / Creator / Other
- optional note

Logging earnings updates:
- `earnedToday`
- `weeklyEarned`
- transaction/activity history

It should NOT automatically change `availableToday` unless a future allocation feature explicitly does so.

### Log spending
Capture:
- amount
- bucket: Life / Con / Fun
- optional note/category

For the prototype, spending may reduce the selected bucket balance and `availableToday` if that is the established manual-spend model.

Never allow a malformed log to crash the app. Clamp/validate numerical input sensibly.

---

## 9. Good Work Window

Nyxie wants preset good gig-working times to become useful reminders.

For this phase, build the UI/data structure, not push notifications.

Card example:

`Good earning window`
`5:00 PM – 9:00 PM`

Show:
- day or recurrence label if useful
- start time
- end time
- edit action
- optional `Today's window` emphasis

Primary CTA can be:
`Start work`

Secondary CTA:
`Skip today`

Do not turn this into detailed shift/timesheet tracking.

A future reminder system can consume these stored windows.

---

## 10. Upcoming Money

Keep this compact. It exists to catch money surprises without making the main screen a full finance app.

Support lightweight upcoming items such as:
- bill
- subscription
- planned cosplay purchase
- convention expense
- larger purchase

Each item may store:
- title
- amount
- due date
- type
- optional bucket
- paid/done state

On the main Money screen, surface only the next 1–3 upcoming items.

Example:
`Phone bill · $40 · Aug 28`
`Cosplay contacts · $24 · Sep 2`

Use neutral/pink/plum urgency treatment instead of green/orange.

---

## 11. Recent activity

Recent activity may live below Upcoming Money or behind a `View activity` affordance.

Keep it lightweight:
- amount
- earned/spent
- source/bucket
- date
- short note

Do not make a dense ledger table on mobile.

For Phase 2C, a short recent list is enough if needed for validating Quick Log.

---

## 12. Yuu-Kun behavior in Money

Yuu-Kun may appear sparingly.

Good examples:
- `Yare yare. $95 gets you on pace today.`
- `Peak money hours start later.`
- `You already knocked out half the mission.`

He may comment on:
- earning goal progress
- work windows
- money deadlines

He should not shame Nyxie for spending or failing to hit a target.

Do not introduce relationship commentary.

---

## 13. Data direction

Prototype money data should be organized enough to support future upgrades.

Suggested shape:

```js
money: {
  availableToday: 114.32,
  weeklyGoal: 1000,
  weeklyEarned: 620,
  daysRemaining: 4,
  earnedToday: 63,
  buckets: {
    life: 72,
    con: 28,
    fun: 14
  },
  transactions: [],
  workWindows: [],
  upcoming: []
}
```

Exact implementation may differ, but preserve the semantic separation between spendable money, earning goals, bucket balances, work windows, and upcoming obligations.

Existing persisted Phase 2A/2B money data must migrate safely.

---

## 14. Interactions

Required for this design pass:

- edit Available Today
- edit weekly goal
- log earnings
- log spending
- choose earning source
- choose spending bucket
- persist changes
- display calculated remaining / suggested daily earning
- display bucket balances
- display work-window card from persisted data
- display upcoming money items from persisted data

Use compact sheets/cards/forms rather than navigating through many nested pages where practical.

---

## 15. Accessibility and mobile behavior

- input labels must be understandable
- currency fields use sensible numeric input modes
- buttons should be semantic buttons
- modal/sheet-like UI, if used, must remain usable by keyboard and screen readers where practical
- no hover-only actions
- touch targets about 44px where practical
- no horizontal scrolling at 360px
- ensure bottom content clears the fixed nav

---

## 16. Explicit non-goals for Phase 2C

Do not add:
- bank account connections
- Plaid or finance APIs
- automatic balance syncing
- tax calculation engine
- mileage tracking
- full accounting/bookkeeping
- investment tracking
- debt payoff engine
- push notifications
- creator invoicing system
- detailed gig timesheets

Do not redesign Home, Plan, Cosplay, or More except for minimal compatibility needed by the new money data shape.

---

## 17. Acceptance criteria

Money passes the design review when:

- Available Today remains semantically separate from earning goals
- Life / Con / Fun buckets are visible and persisted
- Weekly Money Mission is visually prominent and understandable
- earning progress, remaining, days, suggested daily amount, and earned today are all clear
- earnings can be logged with source
- spending can be logged with bucket
- a work-window card exists without becoming a timesheet
- upcoming money items can be stored and surfaced compactly
- legacy money data migrates safely
- screen remains clean at 360–430px
- no green/orange accents appear
- no unrelated modules are redesigned
