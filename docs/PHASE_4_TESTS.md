# Phase 4 Manual Checks

If local Node/npm remains unavailable, complete these checks manually and rely on GitHub Actions for compile/build verification.

1. Open every primary route: Home, Plan, Money, Cosplay, More.
2. From More, open Conventions, Travel, Creator HQ, Wellness, Routines, Yuu-Kun, Settings.
3. Confirm More remains active in the bottom nav in every More child module.
4. Confirm legacy/missing data keys do not crash app initialization.
5. Confirm Wellness saves against the local calendar date.
6. Confirm Yuu changes dialogue for at least task-heavy, low-energy, money, cosplay, convention, travel, and routine contexts.
7. Confirm Yuu never generates relationship/romance commentary.
8. Confirm routine skip note and retry/carry-forward persist without adding Plan tasks.
9. Confirm Creator HQ can persist location and upload deadline and continues using linked IDs.
10. Confirm no new module changes Money balances or creates transactions automatically.
11. Inspect 360px width for horizontal overflow and unusable controls.
12. Confirm no green/orange accents and no accidental source markers.
13. Confirm GitHub Actions build passes, or report exact failure logs.
14. If Pages is configured, open deployed app and verify main navigation loads.
