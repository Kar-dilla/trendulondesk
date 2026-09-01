# Trendulon Desk

Module 01 (Shell / Dashboard) of the Trendulon pipeline. Built against
`TRENDULON_TECH_SPEC.md` v0.2.

## What's here
Just the application shell: branding, navigation, dashboard/home view, and
placeholder routes for every other module. **No news search, ranking,
research, scripting, fact-checking, platform generation, or analytics
logic exists in this repo.** See `docs/module-contracts/01-dashboard.md`.

## Design direction
Redesigned (Aug 31 2026) as a premium editorial control desk, not a
generic SaaS dashboard: flat near-square corners, no shadows or gradients,
no decorative animation, black-dominant with orange reserved for editorial
signals (fit score, priority, the human-review gate). Stories render as a
ranked wire-feed list, not a card grid. Mobile uses a fixed bottom tab bar
instead of a scrolling chip strip. See `tailwind.config.ts` and the inline
comments in `src/dashboard/components/` for the specific rules this
followed.

## Run it

```bash
npm install
npm run dev
```

Then open `http://localhost:3000`. Requires Node.js 18.17+.

This was built in a sandboxed environment without npm registry access, so
the `npm install` above has not actually been run or verified end-to-end.
The code follows standard Next.js 14 App Router + Tailwind conventions, but
run it locally and fix anything `npm install`/`next build` surfaces before
treating it as production-ready.

## Structure

```
app/                     Next.js routes (routing plumbing only)
  page.tsx               Dashboard home
  discover/, stories/, production/, content-factory/, schedule/, analytics/
                          Placeholder routes, one per future module
src/
  dashboard/components/  Module 01's owned components (Nav, StoryCard, etc.)
  lib/                   Shared: types, mock data, DB access stub
docs/
  module-contracts/      01-dashboard.md — this module's contract
```
