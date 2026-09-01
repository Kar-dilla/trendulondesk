# Module 01 — Shell / Dashboard — Contract

Status: **Implemented (UI shell only, mock data)**

Revision note: this contract is unchanged from the previous version.
The Aug 31 2026 pass was a visual/UX redesign only (editorial newsroom
desk styling instead of generic SaaS dashboard) — no function signatures,
table ownership, or DB shape changed. See "Display-only fields" below for
the one addition, which is a rendering of data Module 03 already produces,
not a new column.

## Purpose
Single interface showing pipeline state of every story. No Claude call —
this module is UI + read-only data access only, per TECH SPEC Section 10.

## Route
`GET /` — Dashboard home. No POST route; Module 01 does not trigger
pipeline runs itself (that's Module 02's `/api/discovery/run`, triggered
from the "Find Today's Stories" button, currently a client-side placeholder
per `src/dashboard/components/FindStoriesAction.tsx`).

## Data it reads
Everything comes through `/src/lib/db.ts`. Every function there is
currently a **mock stand-in** returning fixtures from
`/src/lib/mock-data.ts`. Real implementations should:

| Function | Real query (once tables exist) |
|---|---|
| `getTopStories()` | `stories` ordered by `fit_score DESC`, filtered to review-relevant statuses |
| `getDevelopingStories()` | `stories` where status IN (`in_research`, `angle_selected`) |
| `getInProductionStories()` | `stories` where status = `in_production` |
| `getScheduledContent()` | `stories` joined to `production_briefs` where status = `scheduled` |
| `getRecentlyPublished()` | `stories` joined to `posts`, most recent first |
| `getPipelineSummary()` | aggregate counts across `stories` |

**Do not change these function signatures** without updating every
component that imports them (`app/page.tsx`) — this is the seam future
modules (02–12) plug real queries into.

## Shape it expects
See `/src/lib/types.ts` — `StoryCardData`. Matches the `stories` table
shape from TECH SPEC Section 4. `StoryStatus` enum values are the lowercase
snake_case strings Section 3 requires.

### Display-only fields
`fit_reasons?: string[]` — rendered under High Priority rows as the "why
this fits" explanation. This is NOT a new database column; it's a display
binding to Module 03's already-documented output shape
(`{story_id, fit_score, reasons[], recommended_priority}`, Section 10).
When Module 03 is wired up, populate this field from that `reasons[]`
array — don't add a new column for it.

## What Module 01 does NOT do
No news search, scraping, ranking, research, script generation, fact
checking, platform-variant generation, or analytics. Every non-Dashboard
nav route (`/discover`, `/stories`, `/production`, `/content-factory`,
`/schedule`, `/analytics`) renders `ModulePlaceholder` and does nothing
else.

## Integration points for future modules
- Swap real queries into `/src/lib/db.ts` (keep the exported function
  names).
- Populate `/src/lib/types.ts` with additional shared types as new tables
  come online — don't duplicate story shape logic per module.
- `FindStoriesAction.tsx`'s click handler is where Module 02's
  `POST /api/discovery/run` call should go.
- Each nav route's `page.tsx` is where the owning module replaces
  `ModulePlaceholder` with real UI — the route, nav entry, and page file
  already exist so no routing/plumbing work is needed.
