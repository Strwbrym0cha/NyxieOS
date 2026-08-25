# Phase 2E.1 Issue Body

## Goal
Complete the final Phase 2E compatibility link by making Home's `Coming Up` card consume the nearest persisted Convention dynamically.

## Required behavior
- reuse `getNearestConvention` and `countdown`
- show nearest eligible upcoming convention
- show dynamic countdown/date context
- optionally show venue/location if compact
- safe empty state when none exists
- Completed conventions are excluded
- earlier newly-created conventions take priority

## Scope
Compatibility patch only. No visual redesigns and no new modules.
