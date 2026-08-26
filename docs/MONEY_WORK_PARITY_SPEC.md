# NyxieOS Money + Work / Gig Parity Spec

## Purpose
Finish the original Money + Work vision without turning NyxieOS into accounting software or a timesheet.

The original experience is a lightweight daily money command center: what is available today, what has been earned, what the weekly mission needs, whether today is a good work day, and what planned obligations/funds deserve attention.

## Product rules
- Mobile-first 360–430px.
- Pink is the primary foreground color. No green or orange UI accents.
- Keep gig support lightweight. Do not build clock-in/clock-out payroll or timesheets.
- No automatic deductions from Available Today for planned needs, bills, savings, debt, or purchases.
- Money planning records are context, not bank synchronization or accounting truth.
- Preserve Issue #14 derived Planned Needs semantics.
- Preserve Home Money Today from Issue #17.
- No duplicate Cosplay, Convention, Travel, or Creator money records.
- All writes continue through planner `setData`; no direct Supabase calls or schema changes.

## Existing canonical fields to preserve
Current `data.money` already includes fields such as:
- `availableToday`
- `earnedToday`
- `weeklyGoal`
- `weeklyEarned`
- `daysRemaining`
- `buckets`
- `transactions`
- `workWindows`
- `upcoming`

All existing records must remain readable/editable.

## Recommended expanded shape
Exact names can differ, but keep the architecture migration-safe.

```js
money: {
  availableToday: 0,
  earnedToday: 0,
  weeklyGoal: 1000,
  weeklyEarned: 0,
  daysRemaining: 0,
  todayTarget: null,
  buckets: { life: 0, con: 0, fun: 0 },
  transactions: [],
  workWindows: [],
  workWindowCheckins: {
    "YYYY-MM-DD": {
      "window-id": {
        status: "started" | "skipped",
        startedAt: "HH:MM",
        note: ""
      }
    }
  },
  upcoming: [],
  obligations: [],
  savingsGoals: [],
  debts: [],
  purchases: []
}
```

Do not destructively rewrite old data just to match this example.

## Main Money views
Use a compact mobile segmented layout such as:
- Today
- Mission
- Plan
- Activity

### Today
Show:
- Available Today
- Earned Today
- optional Today Target
- target remaining when a target is enabled
- applicable work window(s)
- Start Work / Skip Today actions
- quick Log Earnings / Log Spending access

### Mission
Show:
- Weekly Goal
- Weekly Earned
- Remaining
- Days Remaining
- Suggested average per remaining day
- optional Today Target
- Good Work Windows
- lightweight work-window check-in state
- optional derived logged gig profit context

Suggested amount formula:

```js
remaining = max(0, weeklyGoal - weeklyEarned)
suggestedPerDay = daysRemaining > 0 ? remaining / daysRemaining : 0
```

Do not divide by zero. Do not shame if the goal is behind.

### Plan
Keep planning compact. Include:
- Life / Con / Fun buckets
- Issue #14 Planned Needs
- Bills + subscriptions
- Savings/funds
- Debt planning
- Large planned purchases
- legacy Upcoming Money

### Activity
Show canonical transactions with add/edit/delete.

## Work windows
Existing work windows remain canonical.

Support fields such as:
- id
- label
- days
- start
- end
- active
- note optional

Centralize weekday applicability in `money-derived.js` so Home, Money, and Yuu use the same rule.

Support:
- Weekdays
- Weekends
- named weekdays/abbreviations
- flexible/all-day labels where appropriate

### Start Work
This is a lightweight intent/check-in, not a timesheet.

Starting a window may store:
- status = started
- local start time
- window id

Do NOT require an End Work button or duration/payroll calculation.

### Skip Today
For an applicable window:
- optional “What happened?” note
- mark that window skipped for the local date
- no punishment, streak loss, or automatic rescheduling

A future Reminder system should be able to derive from active work windows. Do not build browser notifications in this pass.

## Transactions
Preserve existing transaction kinds:
- earned
- spent

Preserve old `source` values.

Going forward, support a cleaner optional structure such as:
- `source` / label
- `bucket`: life | con | fun | empty
- `gigRelated`: boolean
- date
- amount
- note optional

Legacy records where `source` is `life`, `con`, or `fun` may be treated as that bucket. Do not treat arbitrary source labels as new Money buckets.

Editing/deleting a transaction must correctly reverse/reapply its effect without duplicate totals or NaN.

Spent transactions:
- reduce Available Today according to existing behavior
- may adjust a valid Life/Con/Fun bucket

Earned transactions:
- increase Weekly Earned
- if dated today, increase Earned Today

No automatic transaction creation from plans.

## Gig profit
Keep this lightweight and derived from transactions only.

A transaction is gig-related when:
- `gigRelated === true`, or
- legacy/source semantics clearly identify it as Gig

Logged gig profit = gig earnings - gig expenses.

Label it clearly as based only on logged transactions. No accounting/tax claims.

## Bills + subscriptions
Use one compact structured collection, e.g. `obligations`, with a type field.

Suggested fields:
- id
- title
- type: Bill | Subscription
- amount
- dueDate or due day
- frequency: One-time | Monthly | Weekly | Annual | Custom
- autopay optional
- active
- note

Show due-soon context. Do not auto-deduct from Available Today.

## Savings / funds
Support lightweight goals/funds.

Suggested types:
- Savings
- Convention Fund
- Travel Fund
- Cosplay Fund
- Other

Suggested fields:
- id
- title
- type
- target
- current
- targetDate optional
- note
- active

No automatic transfers or deductions.

## Debt planning
Support simple debt context only.

Suggested fields:
- id
- title
- balance
- minimumPayment optional
- dueDate optional
- note
- active

Do not build payoff algorithms, APR optimization, financial recommendations, or lender integrations.

## Large purchases
Support planned purchases.

Suggested fields:
- id
- title
- targetAmount
- savedAmount optional
- targetDate optional
- status: Planning | Saving | Ready | Purchased
- note

No automatic transaction when status changes.

## Planned Needs
Issue #14 semantics are frozen unless compatibility requires otherwise.

`getPlannedNeeds(data)` continues to derive from:
- remaining Cosplay need
- active Convention planned budgets
- active Travel planned budgets
- legacy/manual Upcoming Money

Do NOT silently add bills, debt, savings goals, or purchases into this total. Show them as separate planning contexts.

## Shared helpers
Expand `src/money-derived.js` rather than creating competing money math.

Useful pure helpers include:
- `normalizeMoneyRoot`
- `localDate`
- `workWindowApplies`
- `getApplicableWorkWindows`
- `getWeeklyMissionSummary`
- `getTodayMoneyTargetSummary`
- `getWorkWindowCheckin`
- `getUpcomingObligations`
- `getSavingsProgress`
- `getLoggedGigProfit`
- transaction normalization/apply helper if safe

Keep existing exports such as `getPlannedNeeds` compatible.

## Home
Home is already compact and useful after Issue #17.

Do not add another large Money section.

Refactor Home to import shared work-window applicability from `money-derived.js` rather than from Yuu if practical.

Keep Home Money Today values correct:
- Available Today
- Earned Today
- Weekly Mission
- remaining to weekly goal
- Planned Needs

An optional Today Target line is acceptable only if it stays compact.

## Yuu-Kun
Move Money/Work calculations to shared money helpers.

Yuu should accurately answer questions such as:
- How much do I have today?
- How much did I earn today?
- How much is left in my weekly mission?
- How much should I aim to make per remaining day?
- What is my target today?
- Is there a work window today?
- Did I skip work today?
- What bills/subscriptions are coming up?
- How is my convention/travel/cosplay funding looking?
- What is my logged gig profit?

Keep responses deterministic/local.
No financial advice or tax/accounting claims.
No relationship commentary.

## Visual
Pink-first magical Money UI.
- hot/deep pink for mission/progress/actions
- blush/cream/white surfaces
- lavender/plum only as background atmosphere
- no green or orange

Do not use red/green finance conventions as dominant styling.

## Mobile QA
Verify 360px, 390px, 430px:
- segmented views fit/scroll safely
- mission numbers wrap cleanly
- work-window cards remain tappable
- forms do not cause horizontal page overflow
- Life/Con/Fun buckets remain readable
- planning sections do not become one endless wall
- bottom navigation and safe-area spacing remain intact

## Regression safety
Preserve:
- Issue #12 cloud/local sync
- Issue #13 Yuu local assistant
- Issue #14 Planned Needs
- Issue #17 Plan/Home + weekly work-window placement
- Issue #18 Cosplay
- Issue #19 Convention + Con Day
- Issue #15 Wellness
- Issue #20 Creator HQ

Do not start Routines, Travel polish, unified Reminders, or cross-app Modes in this pass.
