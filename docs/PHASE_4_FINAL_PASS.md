# Phase 4 Final Pass

This is the final engineering pass before live-device visual review.

## Required work
- Fix the issues in `docs/FINAL_INTEGRATION_REVIEW.md`.
- Preserve completed core module behavior.
- Add GitHub Actions build verification using Node 20 and `npm install && npm run build` unless a lockfile is intentionally added.
- If practical, add GitHub Pages deployment for the existing Vite static app. Report any repository-setting blocker clearly.
- Review all routes/imports/exports/default migrations for obvious breakage.
- Keep the codebase maintainable by avoiding further growth of `src/main.jsx` where practical.

## Completion standard
A successful final pass should leave NyxieOS ready for a live phone-width review, not for another round of feature expansion.
