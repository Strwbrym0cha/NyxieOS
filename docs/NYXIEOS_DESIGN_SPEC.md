# NyxieOS Design Spec v0.1

## 1. Product identity

NyxieOS is a magical pink mobile-first personal manager for Nyxie. It should help her answer three questions quickly:

1. What matters today?
2. How am I doing with money?
3. What needs to happen next for my cosplay/projects?

It is not a generic productivity dashboard and should not become a giant command-center screen.

---

## 2. Mobile-first layout

Primary target width: 360–430px.

Default layout:
- one vertical content column
- sticky/fixed bottom navigation
- short, stacked cards
- large touch targets
- minimal typing where practical
- collapsible/secondary information instead of dense first-glance screens

Core content should not require horizontal scrolling.

Bottom navigation should account for iPhone safe-area padding.

---

## 3. Visual direction

### Mood
- magical
- pink
- anime/fantasy inspired
- cute but readable
- modern mobile app, not a scrapbook
- sparkles and fantasy details used as accents rather than on every surface

Fairy Tail is an inspiration reference for the magical/adventure feeling only. Do not copy logos, characters, assets, or copyrighted UI/art.

### Palette

Use these as starting design tokens:

- Guild Pink: `#F45BB2`
- Fairy Blush: `#FFD6EC`
- Magic Lavender: `#B89CFF`
- Spell Plum: `#432442`
- Moon Cream: `#FFF8FC`
- White: `#FFFFFF`

Hard bans:
- no green as a UI accent
- no orange as a UI accent

For semantic states, prefer pink/plum/lavender variations and neutral grays rather than introducing green/orange.

### Typography

Preferred direction:
- headings: rounded/friendly display face such as Fredoka
- body/numbers: highly readable rounded sans such as Nunito Sans

If fonts are not added in the base build, use system fallbacks and keep typography tokens easy to swap later.

### Surfaces

Cards should generally use:
- rounded corners
- subtle border or shadow
- strong spacing
- high readability
- restrained decoration

Avoid excessive glassmorphism, heavy blur, low-contrast text, or tiny decorative type.

---

## 4. Navigation

Primary bottom tabs:

1. Home
2. Plan
3. Money
4. Cosplay
5. More

`More` is the future home for:
- Conventions
- Travel
- Creator HQ
- Wellness
- Routines
- Yuu-Kun
- Settings

Do not overcrowd the primary nav.

---

## 5. Reusable components

### MagicCard
Standard stacked content container.

### SectionHeader
Section title, optional icon, optional secondary action such as “View all.”

### ProgressSpell
Progress indicator used for money goals, cosplay completion, and future convention/wellness progress.

### YuuBubble
Compact assistant dialogue card with room for avatar/portrait and short text.

### QuickAdd
Thumb-friendly action trigger for fast entry.

Potential quick-add actions:
- task
- expense
- earnings
- cosplay item
- event

### UrgentChip
Compact indicator for genuinely urgent/deadline-sensitive items.

### GoalRing
Optional circular progress component for money goals. Do not overuse.

---

## 6. Home screen

### Purpose
Show only what matters now.

### Top area
Greeting:
`Good afternoon, Nyxie ✨`

Small date beneath.

Optional YuuBubble:
`Yare yare. Three things today.`

### Today card
Flexible daily checklist.

Example:
- Film TikTok
- Work on cosplay wig
- Dance practice

Tasks are untimed unless Nyxie explicitly gives them a time.

### Money Today card
Primary daily-retention card.

Must support:
- Available Today
- Earned Today
- Weekly Mission progress
- Amount remaining
- CTA into Money

Example:
- Available: `$114.32`
- Earned today: `$63`
- Weekly Mission: `$620 / $1,000`
- `$380 left`

### Current Cosplay card
Show one active cosplay with:
- image placeholder/thumbnail
- character name
- completion percentage
- next incomplete or urgent items
- CTA to open project

### Coming Up card
Show only the next important event/convention/deadline.

Home should remain short enough to scan quickly on a phone.

---

## 7. Plan screen

Plan combines schedule and tasks.

Top segmented control:
- Today
- Week
- Month

Default: Today.

### Scheduled section
Only things with actual times.

Example:
- 2:00 PM Photoshoot
- 7:00 PM Dance practice

### Anytime Today section
Flexible tasks that need completion today but do not require assigned times.

Example:
- Edit video
- Buy contacts
- Wash cosplay

This separation is central to NyxieOS. Do not convert all tasks into time blocks.

Skipped routine/task behavior can later support:
- ask what happened
- offer to move it to tomorrow

Do not implement punitive streak-loss UX.

---

## 8. Money screen

Money is a primary daily-use feature.

### Top summary
Large `Available Today` amount.

### Buckets
Future/early prototype buckets:
- Life
- Con
- Fun

These may be swipeable/chips/cards, but keep the phone layout simple.

### Money Mission
Show:
- weekly target
- amount earned
- amount remaining
- days remaining
- suggested average per remaining day
- today's optional target

Example:
- Goal: `$1,000`
- Earned: `$620`
- Remaining: `$380`
- 4 days left
- Suggested: `$95/day`

### Work windows
Nyxie wants preset good earning times to become reminders.

UI should support a card such as:
`Good earning window: 5:00 PM–9:00 PM`

Actions:
- Start Work
- Skip Today

Do not turn gig work into a giant timesheet product. The priority is helping her make/track money, not administrative detail.

---

## 9. Cosplay screen

### Main list
Cards should support filters such as:
- All
- Making
- Buying
- Ready
- Wishlist

Each cosplay card can show:
- character image
- name
- completion percentage
- target convention
- days remaining
- remaining item count

### Cosplay project page
This is one of the deepest core screens.

Fields/features should support:
- character
- source/anime
- reference images
- target convention
- total budget
- progress
- pieces/components

Each piece should be able to store:
- item name
- make / buy / commission
- cost
- seller/creator
- link
- due date
- ordered state
- arrived state
- progress/status
- notes
- repair status
- packing/readiness status

Nyxie's planning flow is approximately:
`Choose cosplay → list pieces → determine cost → choose make/buy/commission → establish timeline/deadlines.`

The design should make that flow obvious.

---

## 10. More / planned modules

These are planned, but not all are Phase 1 build scope.

### Convention
Future sections:
- overview
- cosplays
- schedule
- packing
- content
- money
- travel

Con Day should eventually be a simplified mode showing:
- current cosplay
- next scheduled event/photoshoot
- content target/progress
- food/water check
- quick actions

### Travel
Keep together:
- flights
- hotel
- rides/car
- addresses
- confirmation numbers
- schedule
- packing
- budget
- weather
- food spots
- emergency info

Flight details should be especially easy to find because flying is a stress point.

### Creator HQ
Future content pipeline:
`Ideas → To Film → Editing → Ready → Posted`

Potential fields:
- platform
- concept
- cosplay
- location
- collaborators
- shoot date
- editing state
- caption
- upload deadline

### Wellness
Gentle only.

Possible signals:
- water
- meals
- sleep
- movement/gym
- steps
- energy
- rest days

Preferred approach:
- gentle check-ins
- weekly averages
- positive affirmations on low-energy days

Avoid shame/punishment language.

---

## 11. Yuu-Kun

Yuu-Kun is part assistant, part mascot, and part retention layer.

### Character direction
- mini blonde catboy
- bratty
- anime-inspired
- expressive
- recurring phrase: `Yare yare.`

### Helpful domains
Yuu-Kun may proactively comment on:
- schedule
- deadlines
- money goals
- work windows
- cosplay progress
- convention prep

### Hard boundary
Yuu-Kun must never comment on or interfere with relationships.

### Future visual states
Possible future expressions/states:
- normal
- bratty
- nagging
- proud
- sleepy
- money mode
- cosplay mode

Phase 1 can use a simple placeholder/avatar area and dialogue component rather than final character art.

---

## 12. Routines and low-energy behavior

Nyxie does not want rigid morning/night routine structures.

Useful categories may include:
- self-care
- cleaning
- car
- gym/movement
- convention prep

When something is skipped, future behavior should favor:
- ask what happened
- offer to move it to tomorrow

Low-energy UX should simplify instead of guilt.

Example tone:
`Today's allowed to be smaller.`

---

## 13. Explicit exclusions / hard no's

- no green accent system
- no orange accent system
- no rigid time assignment for every task
- no forced morning/night routine model
- no relationship tracking/commentary
- no People/Social CRM in V1
- no giant desktop-first dashboard squeezed onto mobile
- no unsolicited feature expansion during base build

---

## 14. Phase 1 design acceptance criteria

The base is acceptable when:

- it feels natural at 360–430px widths
- bottom navigation is comfortable on iPhone-sized screens
- Home, Plan, Money, Cosplay, and More all exist and are navigable
- Home visibly prioritizes today + money + current cosplay + coming up
- Plan visibly separates scheduled items from flexible anytime tasks
- Money visibly supports a weekly mission and today's money context
- Cosplay visibly supports project progress and piece-level planning
- YuuBubble exists as a reusable placeholder assistant component
- colors/tokens are centralized and easy to refine
- the UI remains visually basic enough that the final art/design pass can be applied intentionally afterward
