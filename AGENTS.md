# NyxieOS Codex Instructions

These instructions apply to the whole repository.

## Mission
Build NyxieOS as a mobile-first personal web app for Nyxie. Engineering should support the approved product/design direction rather than inventing a new one.

## Hard product rules

- Design for phone screens first, especially 360–430px widths.
- Keep the primary bottom navigation to: Home, Plan, Money, Cosplay, More.
- V1 priorities are Calendar/Schedule, Tasks, Money, Gig-work earning support, and Cosplay.
- Tasks are flexible by default. Do not force a clock time unless Nyxie explicitly assigns one.
- Money should emphasize available money, weekly/daily goals, earnings progress, and useful work windows.
- Cosplay pages should support per-item cost, make/buy/commission choice, progress, links, deadlines, and packing/readiness.
- Keep people/social tracking out of V1.
- Do not add relationship features or relationship commentary.
- Yuu-Kun may proactively help with schedule, deadlines, money, cosplay, and convention prep. He must never comment on relationships.
- No green or orange in the UI palette.

## Design ownership

Do not improvise a new visual system. Follow `docs/NYXIEOS_DESIGN_SPEC.md`.

When a design detail is unspecified:
1. choose the simplest mobile-friendly implementation;
2. leave it easy to restyle;
3. do not introduce a new visual motif without approval.

## Phase 1 engineering goal

Build a clean functional skeleton, not the final art pass.

Preferred stack for the initial base:
- Vite
- React
- JavaScript
- Plain CSS with CSS custom properties
- localStorage for prototype persistence
- GitHub Pages-compatible static deployment

Do not add a backend in Phase 1.
Do not add authentication in Phase 1.
Do not add external APIs in Phase 1.
Do not add a heavy UI component library in Phase 1.

## Phase 1 required structure

Create working routes/screens for:
- Home
- Plan
- Money
- Cosplay
- More

Provide reusable components for:
- AppShell
- BottomNav
- MagicCard
- SectionHeader
- ProgressSpell
- YuuBubble
- QuickAdd
- UrgentChip

Use placeholder/demo data where needed, but keep demo data centralized and easy to replace.

## Accessibility / mobile UX

- Tap targets should be at least ~44px when practical.
- Body text should remain comfortably readable on a phone.
- Avoid dense tables on narrow screens.
- Avoid horizontal scrolling for core UI.
- Respect safe-area insets for iPhone bottom navigation.
- Bottom navigation should remain reachable by thumb.
- Important actions should not depend on hover.

## Code quality

- Keep components small and reusable.
- Keep data/state logic separate from visual components where reasonable.
- Use clear file names.
- Avoid giant single-file implementations.
- Keep dependencies minimal.
- Run build/lint/tests available in the repo before finishing a task.

## Scope control

If a task says “build the base,” do not independently build Travel, Convention, Creator HQ, Wellness, or advanced Yuu-Kun logic. These are planned expansions under More and will be designed intentionally later.

Do not redesign approved screens while implementing unrelated functionality.
