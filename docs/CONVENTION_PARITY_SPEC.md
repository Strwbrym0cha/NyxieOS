# NyxieOS Convention Parity Spec

## Purpose
Turn the existing convention CRUD into the original NyxieOS Convention Command Center and Con Day experience without creating duplicate data silos.

## Core product goals
- Plan conventions months ahead without forgetting the annoying little pieces.
- Keep cosplay, travel, money, and creator content connected to the same convention.
- Make contacts, shoes, props, packing, badge, hotel/travel, panels, meetups, photoshoots, vendors, food, emergency info, and content easy to see.
- Provide a simplified Con Day screen that answers: what am I wearing, what is next, what content do I still need, have I eaten/drank, and what do I need to grab right now?
- Preserve the pink-first mobile identity and flexible/non-punitive product philosophy.

## Existing current data
Convention records already contain:
- id
- name
- venue
- location
- startDate
- endDate
- status
- budgetEstimate
- schedule[]
- checklist[]
- packing[]
- content { target, done }
- cosplayIds / linkedCosplayIds may exist in older/newer records

Travel can link via `trip.linkedConventionId`.
Creator content can link via `item.conventionId`.
Cosplay projects can link through convention cosplay IDs and project target event/date.

## Expanded convention model
Preserve all legacy fields and add support for:
- badge: { status, type, pickupInfo, confirmation, notes }
- hotelNotes or derived linked travel stay summary
- linkedCosplayIds (canonical preferred field while tolerating cosplayIds)
- panels[]
- meetups[]
- photoshoots[]
- vendors[]
- foodPlan[] or lightweight food entries
- emergencyInfo
- prepPlan / prep stages where useful
- conDay: { active: false, currentCosplayId: null, water: 0, meals: 0, quickNotes: '' } or equivalent canonical structure

Do not duplicate full travel, cosplay, creator, or money records inside Convention.

## Convention list
Each card should show:
- name
- dates
- location/venue
- countdown
- status
- cosplay readiness summary
- prep/packing summary
- content progress

## Convention detail tabs/sections
Recommended mobile structure:
- Overview
- Cosplays
- Schedule
- Prep
- Packing
- Content
- Travel & Stay
- Money
- Con Day

A segmented or chip-based section switch is preferred over one endless page.

## Overview
Show:
- name, dates, location/venue, countdown
- badge status
- linked cosplay count/readiness
- prep completion
- packing completion
- content target progress
- budget estimate
- linked trip summary
- next schedule item
- emergency info shortcut

## Cosplay lineup
Use canonical `data.cosplay.projects`.
Allow selecting multiple cosplay IDs for this convention.
Show per cosplay:
- primary reference thumbnail
- name
- Ready progress
- Packed progress
- next incomplete/urgent piece
- explicit contacts/shoes/props readiness cues

Do not copy cosplay piece data into convention.

## Schedule
Preserve existing schedule entries and support types such as:
- Panel
- Meetup
- Photoshoot
- Vendor
- Food
- General

If specialized arrays are implemented for panels/meetups/photoshoots/vendors, the UI may merge them into a derived timeline rather than duplicating entries.

## Prep
Keep custom prep checklist.
Add derived countdown guidance without automatically creating duplicate checklist records.
Suggested phases:
- 6+ months: convention basics, badge, lodging/travel, initial cosplay choices
- 3–6 months: major cosplay ordering/commissions, shoots/content planning
- 1–3 months: wig/contacts/shoes/props checks, repair needs, schedule
- 2–4 weeks: packing list, confirmations, content shot list, photoshoots
- final week: contacts/shoes/props/chargers/documents/emergency sweep
- day before: bag packed, badge/ID, travel details, food/water plan

Specially surface contacts, shoes, and props because these are known last-minute failure points.

## Packing
Preserve existing convention packing and derive cosplay packing state from linked cosplay pieces.
Do not duplicate every cosplay piece into convention packing.
Show:
- custom convention packing list
- linked cosplay Ready/Packed summaries
- warning/attention list for linked pieces not packed
- quick category checks for contacts, shoes, props, wigs, makeup, costume, tech, documents, snacks/emergency

## Badge
Track optional:
- Not purchased / Purchased / Pickup / Ready
- type
- confirmation
- pickup info
- notes

## Travel & Stay
Derive linked travel data from `data.travel.trips` where `linkedConventionId` matches.
Show compactly:
- destination/trip name
- next flight
- lodging/stay
- local transport
- confirmations count/important confirmation
- Open Travel CTA

Do not copy travel records into convention.

## Money
Use the convention `budgetEstimate` and shared Money helpers.
Show:
- convention planned budget
- linked cosplay remaining estimate, clearly separate
- linked travel planned budget, clearly separate
- combined context may be shown as a planning summary, but do not merge source records or create transactions
- Open Money CTA

## Content
Use linked Creator HQ items where `conventionId` matches.
Preserve convention `content.target` / `content.done` for quick target tracking.
Show:
- target/done progress
- To Film / Editing / Ready counts for linked items
- next shoot/upload deadline
- convention content list
- Open Creator HQ CTA

## Food plan
Keep lightweight and supportive.
Allow simple entries such as:
- title/place
- day/date
- note
No calorie tracking.

## Emergency info
Convention-specific emergency notes may include:
- emergency contact text
- meetup point
- medical/allergy note if user chooses to enter it
- important venue/hotel note
No medical advice.

## Con Day mode
This is the most important parity addition.
Con Day should be a simplified mobile screen for the active convention.

Top priorities:
1. Current cosplay
2. Next scheduled item
3. Content progress / what is still needed
4. Photoshoots
5. Food + water quick checks
6. Badge / essentials
7. Quick actions

Suggested Con Day cards:
- Today at [Convention]
- Current Cosplay with Ready/Packed/contact/shoes/prop status
- Up Next with time/location
- Photoshoots Today
- Content Mission (done/target and linked To Film items)
- Food & Water quick check
- Essentials: badge, phone, charger/battery, ID, contacts, shoes, prop
- Emergency info shortcut

Con Day should not show the full editing UI by default.
Provide an Exit Con Day / Manage Convention action.

## Food/water data strategy
Do not create conflicting full wellness data if Wellness later owns richer logs.
For this pass, either:
- write simple con-day water/meals into a convention-specific `conDay` object and clearly treat it as quick con-day context, OR
- if a shared Wellness helper/model is already available at implementation time, use that canonical wellness data instead.

The later Wellness parity pass may unify this more deeply. Do not block Con Day on Wellness #15.

## Shared helpers
Prefer `src/convention-derived.js` with pure helpers for:
- local date/countdown
- normalized status
- active/upcoming convention
- prep completion
- packing completion
- linked cosplay lookup/readiness
- linked trip lookup
- linked creator items
- next schedule item
- today's schedule/photoshoots
- con-day essentials status
- countdown prep suggestions

## Home + Yuu
Home Coming Up should use shared convention helpers where practical without becoming longer.
Yuu should be able to answer:
- When is my next con?
- What should I prep next?
- Are my contacts/shoes/props ready?
- What isn't packed?
- What is next at the con?
- How many content pieces do I still need?

No API. No relationship commentary.

## Mobile design
- 360–430px
- pink-dominant
- cream/white surfaces
- purple/lavender atmosphere only
- no green or orange
- large taps
- section chips may scroll horizontally
- Con Day should be especially one-handed and glanceable

## Regression safety
Preserve:
- Supabase/localStorage architecture
- Yuu chat
- Money derived math
- Plan/Home parity
- Cosplay parity
- Travel links
- Creator links

No Supabase schema changes.
No duplicate travel/cosplay/creator data.
No Con Day destructive edits.
