# NyxieOS Final Integration Review

Status after Phase 3 batch review.

## What is now complete
The app has functional Home, Plan, Money, Cosplay, Convention, Travel, Creator HQ, Wellness, Routines, Yuu-Kun, and Settings areas with local persistence and mobile-first navigation.

## Final correctness gaps to fix

1. **Wellness must use local dates, not UTC dates.**
   `toISOString().slice(0,10)` can shift the user's day during evening hours in US time zones. Reuse the existing local-date helper or an equivalent local-date calculation.

2. **Yuu-Kun needs the full approved local-rule coverage.**
   The current rule set mainly reacts to unfinished task count and the latest wellness state. Expand deterministic rules so he can also react, concisely, to Money mission pace/work windows, cosplay readiness/deadlines, Convention countdown/prep, Travel departure context, and Routines. Keep relationship/romance commentary completely forbidden.

3. **Routines need the promised flexible skip flow.**
   Keep `Skip today`, but allow an optional short `What happened?` note and a simple `Try again tomorrow`/carry-forward behavior without generating Plan tasks.

4. **Creator HQ needs the missing lightweight production fields surfaced in the UI.**
   Ensure upload deadline and location can be edited. Keep linked cosplay/convention IDs. If collaborators/hashtag/archive/analytics support remains lightweight, a compact local section is sufficient. Do not create a social CRM.

5. **Do an integration pass for accidental source artifacts and route safety.**
   Check all imports/exports/routes/defaults and remove stale unused prototype components only when safe.

## Build verification
The Codex environment has repeatedly lacked Node/npm, so the repository now needs GitHub-side build verification.

Add a minimal GitHub Actions workflow that runs on pushes to `main` and pull requests:
- checkout
- setup Node 20
- `npm install`
- `npm run build`

There is currently no lockfile, so use `npm install` rather than `npm ci` unless a lockfile is intentionally generated and committed in the same pass.

## Optional live preview
If cleanly achievable without changing product behavior, add a GitHub Pages deployment workflow for the Vite static build. Keep the existing relative/static-friendly Vite setup. If Pages requires repository configuration that cannot be completed from the coding environment, report that clearly instead of pretending deployment succeeded.

## Final polish boundaries
- Preserve approved functionality and information architecture.
- No major redesign of completed screens.
- Mobile-first 360–430px.
- No green/orange accents.
- No backend/auth/API/AI calls.
- No relationship/social CRM.
- No automatic Money mutations from other modules.
- Do not invent new modules.

After this pass, the next step should be live-device visual review rather than more feature expansion.
