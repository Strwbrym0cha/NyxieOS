# NyxieOS Original Vision Parity Audit

## Purpose
This audit compares the original NyxieOS discovery/interview and `docs/NYXIEOS_DESIGN_SPEC.md` against the current app. The goal is not to invent a new product. It is to finish the product Nyxie and Kat originally described.

## Source-of-truth principles
- Magical pink, anime/fantasy inspired, mobile-first 360–430px.
- Pink is primary. No green or orange UI accents.
- Flexible tasks, not forced time blocks.
- Home should answer: what matters today, how much money is available today, and what needs attention next.
- Money, cosplay, conventions, travel, creator work, wellness, routines, and Yuu-Kun should share canonical data instead of forcing duplicate entry.
- Yuu-Kun never comments on relationships.
- No People/Social CRM.
- Low-energy behavior should simplify and support, never shame.
- LocalStorage remains offline cache and Supabase remains whole-planner cloud sync.

## Status legend
- DONE: matches intended behavior closely enough.
- PARTIAL: exists but is materially thinner than the original vision.
- MISSING: original feature is not meaningfully implemented.

---

## 1. Home Dashboard — PARTIAL
### Original vision
- Greeting + date.
- Yuu status bubble.
- Today's actual task checklist, not only a count.
- Money Today: Available Today, Earned Today, Weekly Mission progress, amount remaining.
- Current Cosplay: image/reference thumbnail, character, progress, next incomplete/urgent piece.
- Coming Up: next convention/event/deadline.
- Keep the page short and calm.
- Quick-add behavior was part of the reusable component plan.

### Current
- Yuu bubble exists and opens chat.
- Today currently shows task count + Open Plan, not the actual lightweight checklist.
- Weekly planner strip exists.
- Money Today shows Available Today + planned-needs line, but not Earned Today / weekly mission / remaining.
- Current Cosplay shows only active project name, not progress/next piece/image.
- Coming Up exists.

### Finish
- Restore the compact Today checklist.
- Add Earned Today + Weekly Mission context to Money Today without making Home long.
- Upgrade Current Cosplay card with progress + next incomplete/urgent piece + image placeholder/reference thumbnail support.
- Add a reusable Quick Add affordance for common actions.

---

## 2. Plan / Daily Life — PARTIAL
### Original vision
- Today / Week / Month views.
- Scheduled section for items with actual times.
- Anytime Today section for flexible untimed tasks.
- Tasks should never be forced into time blocks.
- Skipped/unfinished behavior should ask what happened and offer moving forward.
- Gentle urgency, no streak punishment.

### Current
- Task CRUD supports date, optional time, urgent, complete.
- Current Plan is one flat Tasks list.
- No Today / Week / Month segmented views.
- No visible Scheduled vs Anytime Today split.
- No built-in skip/reschedule flow for tasks.

### Finish
- Build Today / Week / Month views.
- Separate Scheduled and Anytime Today visually.
- Add task skip / move-to-tomorrow behavior with a lightweight reason prompt.
- Preserve optional times and flexible-day philosophy.

---

## 3. Money + Work / Gig Mode — PARTIAL
### Original vision
- Available Today.
- Daily + weekly earnings.
- Weekly Money Mission: goal, earned, remaining, days remaining, suggested average per remaining day, optional today target.
- Life / Con / Fun separation.
- Good earning windows that can become reminders.
- Lightweight gig support, not a timesheet.
- Bills/subscriptions, savings, convention fund, travel fund, cosplay spending, debt, big purchases, gig profit were part of the discovery scope.

### Current
- Available Today editable.
- Weekly goal / earned / days remaining.
- Life / Con / Fun buckets.
- Transactions.
- Work windows.
- Derived Planned Needs from cosplay/conventions/travel/manual upcoming.
- Missing suggested daily amount and optional today target.
- Work windows are informational only; no Start Work / Skip Today flow.
- No dedicated bills/subscriptions/savings/debt objects beyond generic Upcoming Money.

### Finish
- Add suggested amount per remaining day.
- Add optional Today Money Target.
- Add Start Work / Skip Today actions for applicable earning windows.
- Keep gig tracking lightweight.
- Add simple structured planning areas for bills/subscriptions, savings goals/funds, debt, and large planned purchases only where they improve the original money view. These should remain compact and feed the same Money overview.

---

## 4. Cosplay — PARTIAL, major gap
### Original vision
- Character ideas.
- Wishlist.
- Owned/ready cosplays.
- Making / Buying / Ready / Wishlist filters.
- Character/reference images.
- Wigs, props, contacts, shoes, makeup looks, repairs.
- Cost/budget.
- Per-project target convention/date and days remaining.
- Pieces/components.
- Make / Buy / Commission.
- Seller/creator.
- Link.
- Due date.
- Ordered state.
- Arrived state.
- Progress/status.
- Repair status.
- Packing/readiness status.
- Notes.

### Current
- Multiple cosplay projects.
- Name/source/target event/date/budget/notes.
- Pieces with method/cost/status/due/link/notes.
- Progress based on Ready pieces.
- No project filters.
- No reference/image support.
- No explicit seller/creator.
- No ordered/arrived state.
- No repair state.
- No packing/readiness state separate from generic status.
- No explicit wig/contacts/shoes/props/makeup categorization.
- No days-remaining presentation.

### Finish
- Complete the original project model and UI.
- Add filters: All / Making / Buying / Ready / Wishlist.
- Add project reference image support that works safely in static/local/cloud architecture.
- Add piece category + seller/creator + ordered + arrived + repair + packed/readiness fields.
- Add days remaining and next urgent/incomplete piece.
- Preserve current money-derived calculations.

---

## 5. Creator HQ — PARTIAL
### Original vision
Pipeline:
Ideas → To Film → Editing → Ready → Posted

Features requested:
- Content calendar.
- Post ideas.
- Draft captions.
- Shoot list.
- Editing queue.
- Platform checklist.
- Brand/collab tracker.
- Analytics notes.
- Hashtag bank.
- Photo archive links.
- Posting reminders.
- Convention content plan.
- Work contacts/collaborators only, not a social CRM.

### Current
- Pipeline exists.
- Fields include title, platform, stage, cosplay, convention, location, shoot date, upload deadline, notes, link.
- Missing captions.
- Missing collaborator/photographer/vendor/brand tracking UI.
- Missing analytics notes.
- Missing hashtag bank UI.
- Missing photo archive links UI.
- Missing posting reminders.
- No true content calendar view.
- Convention linkage exists but no focused convention content-plan experience.

### Finish
- Add the remaining original content fields and supporting views.
- Add compact Calendar / Pipeline switch.
- Add caption, collaborators/work contacts, analytics notes, hashtags, archive links, reminder date/time.
- Add convention-content view/filter using existing convention links.

---

## 6. Convention Command Center — PARTIAL, major gap
### Original vision
Per convention:
- dates/location
- hotel/travel
- badge
- cosplay lineup
- packing
- budget
- panels
- meetups
- photoshoots
- vendor plans
- food plan
- emergency info
- content plan
- money/travel links
- automatic countdown prep/checklist

Con Day mode:
- current cosplay
- next scheduled item/photoshoot
- 9 TikTok/content target context from interview
- photoshoots
- food/water intake
- quick actions

Nyxie plans conventions roughly six months ahead and specifically called out contacts, shoes, and props as last-minute failure points.

### Current
- Convention basics: name, venue, location, dates, status, budget estimate.
- Schedule, custom prep, packing, content target.
- Cross-cleanup links to travel/creator on delete.
- No visible cosplay lineup editor.
- No badge/hotel/travel summary.
- No panels/meetups/photoshoot/vendor/food/emergency structured sections.
- No countdown-generated prep stages.
- No Con Day simplified mode.

### Finish
- Add overview / cosplays / schedule / prep / packing / content / money / travel structure.
- Add linked cosplay selection UI.
- Add badge, hotel/travel summary, panels/meetups/photoshoots/vendor/food/emergency data.
- Add countdown-driven prep suggestions, especially contacts/shoes/props checks.
- Build Con Day mode with current cosplay, next schedule item, content progress, photoshoots, food/water quick check, and quick actions.

---

## 7. Travel — PARTIAL but closest to original
### Original vision
- Flights.
- Hotel.
- Car/rides.
- Addresses.
- Confirmation numbers.
- Schedule.
- Packing.
- Budget.
- Weather.
- Food spots.
- Emergency info.
- Reusable packing templates + trip-specific items.
- Flight info must be especially prominent because flying is stressful.
- Post-trip reset: unpack, laundry, expense check, content dump.

### Current
- Flights, stays, transport, itinerary, packing, confirmations, food spots, post-trip reset.
- Packing templates.
- Budget and emergency info.
- Convention linking.
- Missing weather.
- Flight information exists but is not presented as a strong prominent flight summary.
- Post-trip reset is generic checklist rather than seeded original reset actions.

### Finish
- Add travel weather context without making the app dependent on a paid API; if live weather is not added, support manual/linked weather context cleanly.
- Make next flight the strongest card in a trip.
- Seed/offer reusable post-trip reset actions: unpack, laundry, expense check, content dump.
- Improve packing categories toward clothes, cosplay, wigs, makeup, tech, meds/toiletries, documents, snacks, emergency kit.

---

## 8. Wellness + Energy — PARTIAL, major rebuild
Tracked separately in GitHub Issue #15.

Original vision includes:
- Water log.
- Meals.
- Sleep.
- Movement.
- Gym.
- Steps.
- Mood.
- Energy.
- Rest days.
- Optional medication/vitamins.
- Appointments.
- Optional weight/measurements.
- fitness/body goals.
- gentle check-ins.
- weekly averages/check-in.
- positive affirmations.
- meaningful low-energy mode.

Issue #15 is the implementation backlog for this area.

---

## 9. Routines — PARTIAL
### Original vision
- Flexible repeating routines.
- No forced Morning / Night model.
- Useful categories can include self-care, cleaning, car, gym/movement, convention prep, post-con recovery.
- Daily/repeating support.
- Skip today → ask what happened → try again tomorrow.
- Low-energy simplification.

### Current
- Create routine with name + comma-separated steps.
- Step completion by date.
- Skip Today asks what happened.
- Try Again Tomorrow state exists.
- No recurrence/schedule controls.
- No routine categories.
- No dedicated daily-repeat behavior/config.
- No low-energy routine simplification.

### Finish
- Add recurrence: daily / selected weekdays / weekly / flexible/manual.
- Add optional category.
- Show only applicable routines for today by default.
- Improve Try Again Tomorrow/carry-forward behavior.
- Low-energy mode should surface a tiny version rather than every step.

---

## 10. Reminders + Attention — MISSING
### Original discovery included
- Appointments.
- Conventions/trips.
- Bills.
- Deadlines.
- Packing/leaving-home reminders.
- Work earning-window reminders.
- Posting reminders.
- Visual badges/countdowns/text-like pings.
- Optional nag mode only for deserving items.

### Current
- No unified reminder model or reminder inbox/attention system.
- Some dates exist in modules but do not surface through a shared reminders layer.

### Finish
- Add a local-first Reminder/Attention model shared across modules.
- Support due date/time, linked source, priority/nag eligibility, done/dismissed/snoozed.
- Start with in-app reminders; browser notifications can be optional and permission-based later.
- Derive/suggest reminders from real linked records where appropriate instead of duplicating all source data.
- Yuu may surface reminders only within his allowed planner domains.

---

## 11. Yuu-Kun — FUNCTIONALLY STRONG, visual polish remaining
### Original vision
- Blonde mini catboy.
- Bratty personality, “Yare yare.”
- Helps schedule/tasks, money, work windows, cosplay, convention prep, travel, routines, wellness/content.
- Never relationships.
- Visual states normal/bratty/nagging/proud/sleepy/money/cosplay.

### Current
- Local no-API chat assistant exists.
- Deterministic intents, current planner context, safe actions, follow-ups, bounded history.
- Relationship boundary exists.
- Avatar is still placeholder `Y`, not the final Yuu artwork/sprite states.

### Finish
- Integrate final Yuu sprite/art states later without changing his local assistant architecture.
- Update context as modules gain parity.

---

## 12. Modes — MOSTLY MISSING AS EXPERIENCES
The discovery explicitly considered:
- Normal Day
- Con Prep
- Con Day
- Travel
- Work Money
- Reset Day
- Low-Energy
- Creator Day

Current modules exist, but most are not implemented as intentional simplified modes.

### Finish
Implement modes as presentation/context layers, not duplicate datasets:
- Con Prep and Con Day from Convention data.
- Travel from active trip.
- Work Money from Money + work windows.
- Reset Day from routines/wellness/travel-reset context.
- Low-Energy across Home/Plan/Routines/Wellness/Yuu.
- Creator Day from Creator HQ schedule/content.

Do not create a separate competing data model for each mode.

---

## 13. Settings / Personalization — PARTIAL
### Current
- Display name.
- Yuu prompts toggle.
- Nag level.
- Cloud Sync card.
- Reset local prototype data.

### Finish
Add only settings required by original features as they are built, e.g.:
- wellness optional-section visibility/goals
- reminder behavior/permissions
- preferred default Home/Plan view if needed
- Yuu visual/personality controls already supported by nag level

Do not turn Settings into a giant configuration maze.

---

## 14. Cloud Sync — IMPLEMENTED, LIVE AUTH QA STILL REQUIRED
- Supabase integration exists on `nyxie_planner_data` only.
- Local-first cache remains.
- Magic-link auth exists.
- Build/Pages passed.
- Live Nyxie magic-link sign-in, remote hydration, and authenticated autosave still require real account smoke testing before Issue #12 can be honestly closed.

---

# Priority roadmap

## P0: Restore the original daily-use spine
1. Plan Today/Week/Month + Scheduled/Anytime split.
2. Home checklist + fuller Money Today + Current Cosplay card.
3. Cosplay project model parity.
4. Convention Command Center + Con Day.
5. Wellness rebuild (Issue #15).

## P1: Complete the lifestyle systems
6. Creator HQ parity.
7. Money/Work mission parity.
8. Routines recurrence + low-energy behavior.
9. Travel polish/weather/flight priority/reset.
10. Reminder/Attention system.

## P2: Mode and art pass
11. Cross-app modes: Low-Energy, Work Money, Creator Day, Reset Day, Con Prep/Con Day, Travel.
12. Final Yuu sprite/art integration.
13. Final cross-module mobile polish and data-flow QA.

# Definition of “NyxieOS matches the vision”
NyxieOS should not be considered feature-parity complete until every PARTIAL/MISSING item above is either implemented or explicitly rejected by Nyxie/Kat. Existing working behavior should be preserved while gaps are filled. No module should re-enter data another module already owns.