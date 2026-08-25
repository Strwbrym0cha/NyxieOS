# Phase 2B Implementation Notes

Implement the approved Plan redesign from `docs/PLAN_DESIGN_SPEC.md`.

This phase is intentionally limited to Plan plus the minimum Home compatibility changes required by date-aware task data.

## Required work

- Read `AGENTS.md`, `docs/NYXIEOS_DESIGN_SPEC.md`, and `docs/PLAN_DESIGN_SPEC.md` before editing.
- Preserve the existing Home, Money, Cosplay, and More visual designs except for compatibility changes required by date-aware tasks.
- Make task data date-aware and preserve `time: null` as the Anytime state.
- Safely migrate existing legacy tasks in `nyxie-data` localStorage.
- Implement functional Today / Week / Month views.
- Default new tasks to Anytime.
- Allow time to be added intentionally rather than requiring it.
- Keep completed tasks visible but softened in the selected day.
- Ensure Home shows current-local-date tasks only after migration.
- Keep all primary interactions phone-friendly at 360–430px.

## Verification

- no horizontal scrolling at 360px
- bottom nav remains safe-area aware
- Today/Week/Month navigation works
- Scheduled and Anytime remain visibly distinct
- legacy stored data does not crash or disappear
- current-day Home tasks remain correct
- no green or orange accents
- no unrelated module redesign

Stop after Phase 2B.
