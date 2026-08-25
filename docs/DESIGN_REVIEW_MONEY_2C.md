# NyxieOS Design Review — Phase 2C Money

## Status
Approved to continue.

Commit reviewed: `0db2b37aa98c59f840a7717a676a4c353ed16230`

## What passes

The Phase 2C implementation preserves the core money semantics:

- `Available Today` is a separately persisted spendable value.
- Weekly earning progress lives in `weeklyGoal`, `weeklyEarned`, `daysRemaining`, and `earnedToday`.
- Suggested earning pace is derived separately rather than mislabeled as spendable money.
- Life / Con / Fun bucket values persist.
- Earnings and spending create compact recent-activity entries.
- Earnings do not automatically increase `Available Today`.
- Spending updates the chosen bucket and decreases `Available Today` under the current prototype model.
- Work-window and upcoming-money structures are persisted without turning the app into a timesheet or bookkeeping suite.
- The screen remains one-column and mobile-first.

## Small later-polish notes

These are not blockers for Phase 2D:

1. `Start work` currently appears as a visual action but is not yet a meaningful session state. That can wait until the future work/reminder pass.
2. Spending/activity notes and richer upcoming-money editing can be added later if Nyxie actually needs them. Do not expand Money now just because the data model could support more.
3. Keep watching for numeric-input edge cases when a field is temporarily empty while editing. The current validation direction is correct; future polish can improve editing feel without changing semantics.
4. Do not let future money features swallow the app. NyxieOS Money should remain a fast “what can I use / what do I need to earn / what is coming up?” tool.

## Decision

Phase 2C is good enough to lock for now. Continue to the Cosplay redesign without reworking Money unless a compatibility change is strictly necessary.
