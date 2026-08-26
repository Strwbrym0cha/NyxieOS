# Routines Parity Implementation Checklist

Use this alongside `docs/ROUTINES_PARITY_SPEC.md`.

## Scope
Only complete Routines parity.

Do not start Travel polish, unified Reminders, cross-app Modes, or final Yuu sprite work.

## Required implementation
- Dedicated `src/Routines.jsx`
- Shared `src/routine-derived.js`
- Remove embedded Routines implementation from `src/MoreModules.jsx`
- Today / All views
- Recurrence: Daily, Weekdays, Weekends, Selected weekdays, Manual
- Categories
- Active / paused state
- Step CRUD
- Legacy string-step support
- Legacy numeric-index completion support
- Per-date completion
- Skip today with optional note
- Try tomorrow / one-day carry-forward
- Low-energy tiny-step support using `lowEnergy: true`
- Shared Wellness-derived low-energy detection
- Yuu routine context/intents/dialogue integration
- Mobile 360 / 390 / 430 QA
- No Supabase/schema/auth changes

## Exact behavior checks
- Skipped does not mean complete.
- Carry-forward does not rewrite recurrence.
- Low-energy mode does not mutate routine data.
- No tiny step is inferred automatically.
- Paused routines stay visible in All.
- Manual routines stay out of Today unless explicitly carried forward/opened.
- Historical completion survives edits.
- Home can remain unchanged.

## Final verification
- `npm install`
- `npm run build`
- Push final implementation SHA to `main`
- Exact SHA Build workflow success
- Exact SHA Pages workflow success
- Report final SHA, commits, files changed, legacy strategy, recurrence logic, skip/carry-forward behavior, low-energy behavior, Yuu integration, mobile QA, Build run, Pages run
