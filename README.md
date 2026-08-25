# NyxieOS ✨📱

NyxieOS is a mobile-first personal dashboard designed around Nyxie's real life: flexible daily planning, money goals, cosplay projects, conventions, travel, creator work, wellness, and a bratty little assistant named Yuu-Kun.

## Product direction

NyxieOS is not a recolored KatOS and not a generic planner. It is a magical pink personal manager built specifically for a cosplayer/creator whose schedule, money, projects, and conventions overlap constantly.

### Core V1 features

1. Calendar / schedule
2. Flexible daily tasks
3. Money dashboard + money missions
4. Gig-work earning support
5. Cosplay tracker

### Mobile-first requirement

Nyxie primarily uses a phone. Design for 360–430px screens first. Desktop/tablet layouts are secondary.

### Visual direction

- Magical + pink
- Anime/fantasy inspired, with Fairy Tail as a mood reference, not copied UI or copyrighted assets
- Soft fantasy cards, sparkles used sparingly, readable modern mobile layout
- No green
- No orange

### Main navigation

- Home
- Plan
- Money
- Cosplay
- More

### Yuu-Kun

Yuu-Kun is NyxieOS's mini blonde catboy assistant. He is bratty, useful, and schedule-focused. His recurring phrase is “Yare yare.” He may help with schedules, deadlines, money, cosplay, and conventions. He must never comment on or interfere with relationships.

## Phase 1 foundation

The initial Vite/React implementation lives in `src/` and uses plain CSS custom properties plus localStorage prototype persistence.

```bash
npm install
npm run dev
npm run build
```

Product and engineering requirements are documented in `AGENTS.md` and `docs/NYXIEOS_DESIGN_SPEC.md`.

