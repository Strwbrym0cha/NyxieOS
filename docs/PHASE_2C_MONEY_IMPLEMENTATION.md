# Phase 2C Implementation Brief — Money

Implement the approved Money design in `docs/MONEY_DESIGN_SPEC.md`.

## Read first

1. `AGENTS.md`
2. `docs/NYXIEOS_DESIGN_SPEC.md`
3. `docs/MONEY_DESIGN_SPEC.md`
4. `docs/DESIGN_REVIEW_PLAN_2B.md`
5. the Phase 2C GitHub issue

## Scope

This pass is limited to:
- Money screen redesign
- money-data migration/extension
- minimal compatibility updates required by the new money data

Do not redesign other major screens.

## Data requirements

Extend persisted `money` data to support:

- `availableToday`
- `weeklyGoal`
- `weeklyEarned`
- `daysRemaining`
- `earnedToday`
- Life / Con / Fun bucket balances
- transaction/activity history
- work windows
- upcoming money items

Preserve existing Phase 2A/2B data.

Use a safe merge/migration approach so older localStorage does not crash or silently erase usable money values.

## Required Money UI

### 1. Available Today
- large, readable hero amount
- manually editable
- clearly described as usable/spendable money
- not derived from weekly mission math

### 2. Buckets
Display:
- Life
- Con
- Fun

Persist balances.

Keep the controls compact and mobile-first.

### 3. Weekly Money Mission
Show:
- weekly goal
- weekly earned
- remaining
- days remaining
- suggested average per remaining day
- earned today
- progress

Allow weekly goal editing.

### 4. Quick Log
Provide:
- Log earnings
- Log spending

Earnings fields:
- amount
- source: Gig / Creator / Other
- optional note

Spending fields:
- amount
- bucket: Life / Con / Fun
- optional note/category

Logging earnings updates weekly/today earning totals and activity history.

Logging spending updates activity history and the selected bucket. If the implementation treats `availableToday` as the manually tracked amount remaining for today, subtract logged spending from it. Do not add earnings to Available Today automatically.

Validate numeric inputs and avoid NaN/negative-state crashes.

### 5. Good Work Window
Use stored data to show a compact example such as:
- 5:00 PM–9:00 PM
- today's/selected day label
- Start work
- Skip today
- Edit

This is not a timesheet and does not need push notifications.

### 6. Upcoming Money
Support a small persisted list for items such as:
- bill
- subscription
- cosplay purchase
- convention cost
- large planned purchase

Show only the next 1–3 items on the main Money view, sorted by date where practical.

### 7. Recent Activity
A short recent activity list may be included so users can confirm earnings/spending logs.

Avoid a desktop ledger table.

## Mobile layout

Target 360–430px first.

Order:
1. header
2. Available Today
3. buckets
4. Weekly Money Mission
5. Quick Log
6. Good Work Window
7. Upcoming Money
8. optional recent activity

Keep one column and no horizontal scrolling.

## Visual requirements

Continue the approved palette and visual language:
- Guild Pink
- Fairy Blush
- Magic Lavender
- Spell Plum
- Moon Cream
- White

No green or orange.

Money may use a stronger plum/pink hero treatment than ordinary cards.

## Yuu-Kun
If used on Money, keep him short and useful.

Allowed topics:
- weekly mission
- suggested earning amount
- work window
- money deadlines

No shame language and no relationship commentary.

## Accessibility

- semantic buttons
- visible labels
- appropriate numeric input types/input modes
- touch-friendly controls
- no hover dependency
- maintain readable contrast

## Non-goals

Do not add:
- bank sync
- finance APIs
- tax engine
- mileage tracker
- accounting software features
- investments
- debt payoff planner
- notifications
- creator invoicing
- detailed timesheets

## Verification

Before completion:
- inspect diff
- verify existing localStorage migrates safely
- verify log earnings and log spending persist
- verify bucket balances persist
- verify Available Today remains separate from earnings mission
- verify calculations cannot divide by zero or produce invalid values
- verify layout at approximately 360px
- verify bottom nav still works
- ensure no unrelated screen gets a major redesign
- run build/tests if environment supports them

Stop after Phase 2C.
