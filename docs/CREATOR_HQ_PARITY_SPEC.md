# Creator HQ Parity Spec

## Goal
Turn the current Creator HQ stage-filter CRUD into the full original NyxieOS Creator HQ while preserving canonical links to Cosplay and Conventions.

This is not a new product direction. It restores the creator/content system from the original NyxieOS discovery and parity audit.

## Product principles
- Mobile-first 360–430px.
- Pink-first magical NyxieOS styling.
- Fast capture, low-friction planning, minimal typing where possible.
- One canonical content item model. Calendar, pipeline, convention plan, and Yuu should all read the same items.
- No duplicate Creator records inside Convention or Cosplay.
- Work/collab contacts only. Do not create a friends/social CRM.
- Local-first/offline-capable. No external API is required for this pass.

## Current state
Current `CreatorHQ` in `src/MoreModules.jsx` supports:
- stages: Ideas / To Film / Editing / Ready / Posted
- title
- platform
- cosplay link
- convention link
- location
- shoot date
- upload deadline
- notes

The existing root already anticipates:
```js
creator: {
  items: [],
  collaborators: [],
  hashtagBank: [],
  archiveLinks: []
}
```

Those structures should be completed rather than replaced arbitrarily.

## Architecture
Move Creator HQ into a dedicated module:
- `src/CreatorHQ.jsx`
- `src/creator-derived.js`

Remove the old embedded CreatorHQ implementation from `MoreModules.jsx` after routing the dedicated component.

Do not create two competing Creator HQs.

## Main views
Use a compact mobile view switch such as:
- Pipeline
- Calendar
- Tools
- Convention

Exact labels may vary slightly if cleaner, but the functionality must remain obvious.

### Pipeline
The canonical stages remain:
Ideas → To Film → Editing → Ready → Posted

Support stage chips and/or horizontal kanban-like sections that work on a phone.

Each content card should show useful context without becoming huge:
- title
- platform(s)
- stage
- shoot date when relevant
- post/upload deadline
- linked cosplay
- linked convention
- reminder state if present
- collaborator/brand context when present

### Calendar
Provide a real content-calendar view based on the SAME content items.

At minimum support a month overview plus selected-day agenda, or another phone-friendly calendar that makes these dates visible:
- shoot date
- edit/review date if stored
- upload/post deadline
- reminder date

Do not duplicate items into calendar events.

## Content item model
Preserve all current fields and tolerate legacy items.

Recommended additive shape:
```js
{
  id,
  title,
  stage,
  platform,
  platforms: [],
  cosplayId,
  conventionId,
  location,
  shootDate,
  editDate,
  uploadDeadline,
  reminderAt,
  captionDraft,
  shootList: [],
  editChecklist: [],
  platformChecklist: [],
  collaboratorIds: [],
  brandCollabId: null,
  analyticsNotes,
  hashtags: [],
  archiveLinks: [],
  notes,
  link
}
```

Exact field names may differ, but old items must render safely and unknown fields must survive edits.

## Platforms
Support common platforms without forcing only one:
- TikTok
- Instagram
- YouTube
- X / Twitter
- Other

Legacy single `platform` remains readable.
New multi-platform support may use `platforms` while preserving compatibility.

## Caption drafting
Every content item can have an optional caption draft.

Support simple editing and copy-friendly presentation.
No AI generation or external API is required.

## Shoot list
Support per-item shoot/checklist steps such as:
- opening shot
- cosplay reveal
- transition
- closeup
- venue B-roll

Each step should support:
- id
- text
- done

This is not the same as stage progression.

## Editing queue
Editing must be more than a stage label.

Support optional editing checklist steps such as:
- rough cut
- audio
- captions/subtitles
- color/effects
- final review

Do not force every item to use these.

The Editing view/summary should surface items currently in Editing and their checklist progress.

## Platform checklist
For multi-platform content, support per-platform completion such as:
- TikTok ready/posted
- Instagram ready/posted
- YouTube ready/posted

Do not automatically mark the whole content item Posted merely because one platform is done.

A content item may be considered fully Posted when the user explicitly sets the stage or all intended platform checklist entries are posted and the UI offers a safe explicit transition.

## Collaborators / work contacts
Complete `creator.collaborators` as WORK-ONLY contacts.

Suggested fields:
- id
- name
- role/type
- handle/contact
- link
- notes

Useful roles:
- Photographer
- Videographer
- Editor
- Cosplayer
- Vendor
- Brand
- Other

These contacts may be linked to content items.

Do NOT add birthdays, friendship notes, relationship history, social reminders, or general people tracking.

## Brand / collab tracker
Support lightweight creator-business collaboration planning.

This can be a dedicated array such as `creator.collabs` or a typed subset of work contacts plus item fields.

Suggested collab fields:
- id
- brand/title
- contact/collaborator id optional
- status
- deliverable
- due date
- compensation/note optional
- linked content item ids
- notes

Suggested statuses:
- Pitch / Inquiry
- Discussing
- Confirmed
- Delivering
- Complete

Do not turn this into invoicing/accounting software.
Money amounts, if stored, are context only unless Money parity later explicitly links them.

## Analytics notes
Per content item support optional analytics/performance notes.

Suggested simple fields:
- views optional
- likes optional
- comments optional
- saves/shares optional
- freeform note

This is user-entered reflection only.
No external analytics API in this pass.
Do not gamify or shame low numbers.

## Hashtag bank
Complete `creator.hashtagBank`.

Support:
- add
- edit
- delete
- optional category/group
- quick copy/use on content item

A content item may reference/copy hashtags without requiring duplicated special database structures.

## Archive links
Complete `creator.archiveLinks` and item-level archive/reference links.

Useful examples:
- Google Photos album
- Drive folder
- Dropbox folder
- posted URL
- raw footage folder

Support label + URL + optional note.

Do not upload files in this pass.

## Posting reminders
Support a lightweight local reminder field on content items:
- reminder date/time
- enabled/dismissed state if useful

This pass does NOT need browser push notifications.
The future unified Reminder/Attention system should be able to derive from this field later.

Creator HQ should surface due/soon reminders in-app.

## Convention content planning
Convention content must use canonical `item.conventionId` links.

Add a focused Convention Creator view/filter:
- choose convention
- see all linked content
- content target context from the Convention if available
- Ideas / To Film / Editing / Ready / Posted counts
- shoot dates
- upload deadlines
- linked cosplay
- missing-content/remaining-target context

Do NOT duplicate Convention `content.target` / `content.done` into Creator storage.
Convention remains canonical for its numeric mission target.
Creator remains canonical for actual content records.

Issue #19 Con Day already derives Creator items. Preserve that behavior.

## Cosplay linkage
Use canonical `data.cosplay.projects`.
Show linked cosplay name/reference where useful.
Do not copy cosplay project data into Creator items.

## Derived helpers
Create `src/creator-derived.js` with pure helpers such as:
- normalizeCreatorRoot
- normalizeCreatorItem
- getItemsByStage
- getCreatorCalendarEntries
- getCreatorItemsForDate
- getUpcomingCreatorDeadlines
- getCreatorReminderItems
- getConventionCreatorItems
- getConventionCreatorSummary
- getItemShootProgress
- getItemEditProgress
- getItemPlatformProgress
- getLinkedCollaborators
- getDailyCreatorFocus

Use local-calendar-safe date handling.
Avoid duplicating Creator calculations in Creator HQ, Convention, Home, and Yuu.

## Creator Day compatibility
Do not build the full cross-app Creator Day mode yet if it would bloat this pass.
But structure helpers/components so the future mode can easily surface:
- today’s shoots
- editing queue
- posting deadlines
- quick capture

## Home
Keep Home short.
Do not add a large Creator section.

At most, add one compact creator cue only if there is a genuinely urgent shoot/upload due today and it does not make Home noisy.
It is acceptable to leave Home unchanged in this pass.

## Yuu-Kun
Expand deterministic Creator context using shared helpers.

Yuu should accurately answer questions like:
- “What do I need to film?”
- “What am I editing?”
- “What needs to post soon?”
- “What am I posting today?”
- “What content do I have for the con?”
- “Who am I shooting with?”
- “What caption did I write for [item]?”

No API.
No content generation required.
No relationship commentary.
No broad destructive actions.

## Legacy compatibility
Existing item example:
```js
{
  id,
  title,
  platform,
  stage,
  cosplayId,
  conventionId,
  location,
  shootDate,
  uploadDeadline,
  notes,
  link
}
```

Must continue rendering/editing without migration failure.

When editing, spread existing objects first so unknown fields survive.

## Delete/link safety
Deleting a content item must not alter linked Cosplay or Convention records unnecessarily.
Convention summaries should simply stop deriving the deleted item.

Deleting a collaborator/collab that is referenced by items should safely clear or tolerate stale IDs without crashing.

Deleting a Convention or Cosplay already has cleanup behavior elsewhere. Preserve it.

## Visual design
Pink-first NyxieOS.
- hot pink / deep pink / blush foreground hierarchy
- white/cream surfaces
- lavender/plum only atmospheric/background weight
- no green
- no orange

Creator HQ can feel energetic and editorial without abandoning the magical-pink identity.

## Mobile QA
Verify 360px / 390px / 430px:
- pipeline chips usable
- calendar month grid readable
- cards wrap long titles/handles
- caption editor comfortable
- checklist rows large enough to tap
- platform chips wrap/scroll safely
- collaborator names wrap
- convention filter works
- no horizontal page overflow
- bottom nav and safe areas remain usable

## Regression safety
Preserve:
- Issue #12 cloud/local sync
- Issue #13 Yuu local chat
- Issue #14 Money derived calculations
- Issue #17 Plan/Home
- Issue #18 Cosplay parity
- Issue #19 Convention + Con Day
- Issue #15 Wellness parity

Do not change Supabase schema.
Do not add external AI/API calls.
Do not start Money/Work parity, Routines parity, Travel polish, or unified Reminders yet.

## Acceptance tests
1. Legacy content item renders safely.
2. Pipeline stages preserve Ideas → To Film → Editing → Ready → Posted.
3. New item defaults cleanly and persists.
4. Multi-platform selection persists without breaking legacy `platform`.
5. Caption draft add/edit persists.
6. Shoot-list checklist progress updates independently of stage.
7. Edit checklist progress updates independently of stage.
8. One platform Posted does not force whole item Posted.
9. Collaborator add/edit/delete works.
10. Item can link one or more work collaborators.
11. Brand/collab tracker works without becoming a social CRM.
12. Hashtag bank CRUD works.
13. Hashtag(s) can be used/referenced on an item.
14. Archive link CRUD works.
15. Item-level archive/reference link works.
16. Analytics notes/numbers persist and never affect progress/status automatically.
17. Calendar shows shoot/upload/reminder dates from canonical items.
18. Selected calendar date shows correct items.
19. Reminder due soon surfaces in Creator HQ without browser notification requirement.
20. Convention filter shows canonical `conventionId` items.
21. Convention target/done remains read from Convention, not duplicated.
22. Issue #19 Con Day linked Creator summary still works.
23. Cosplay links remain canonical.
24. Yuu answers To Film / Editing / posting-deadline questions from shared helpers.
25. Refresh local-only persists new fields.
26. No direct Supabase calls or schema changes.
27. `npm install` and `npm run build` pass in CI.
28. Exact final SHA has successful Build and Pages workflows.
