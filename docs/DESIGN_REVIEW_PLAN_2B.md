# NyxieOS Design Review — Plan Phase 2B

Reviewed commit: `3175137122b0a7967e179bcf3736b24f033ad7fc`

## Status

**Approved to continue.**

The Phase 2B implementation preserves the core NyxieOS planning rule: a task may belong to a day without being forced into a clock time.

## What is working

- Tasks now support `date`, optional `time`, `done`, and `urgent`.
- Legacy undated tasks migrate to the current local date.
- Legacy tasks remain Anytime by default.
- Today separates Scheduled and Anytime tasks.
- Fast add defaults to Anytime.
- A time is added only intentionally.
- Unfinished Anytime tasks can move to tomorrow.
- Week uses a vertical phone-friendly overview instead of seven narrow desktop columns.
- Month uses compact calendar cells and activity indicators.
- Home now reads current-local-date tasks.
- Completed tasks remain visible but visually softened.
- Existing mobile bottom navigation and color guardrails remain intact.

## Small follow-up notes

These are not blockers for Phase 2C:

1. Home's section microcopy currently says `Anytime today` while Home can surface both scheduled and Anytime tasks. In a later Home polish pass, use neutral wording such as `Today` or visually distinguish scheduled items if both remain present.
2. Continue improving semantic interaction patterns over time. Avoid nesting button-like actions inside label behavior where it could make tap behavior ambiguous.
3. The prototype sample content can be replaced during later content polish. It should not drive architecture decisions.

## Decision

Do not reopen Plan for a major redesign now. Continue to the Money experience, which is a primary daily-retention surface for NyxieOS.
