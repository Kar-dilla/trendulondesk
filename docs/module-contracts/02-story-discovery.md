# Module 02 — Story Discovery — Contract

**Status:** Batch 1 **LOCKED** (data models + interfaces + validation).  
**Next:** Batch 2 implementation (orchestration, repository, scoring, basic dedup, optional API).  
**Canonical path:** `docs/module-contracts/02-story-discovery.md`  
**Code root:** `src/discovery/`  
**Locked Module 01 commit:** `5b33ffd Complete Module 01 Trendulon Desk` — do not modify Module 01 files.  
**Locked Batch 1 HEAD:** `cb2ac7d Add Module 02 with TS2352 fix in story-validation`

References: `TRENDULON_TECH_SPEC.md` v0.2 §3–§5, §7, §10 (Module 02); Batch 1 types under `src/discovery/`.

---

## 1. Purpose

Find candidate stories from news/RSS-style providers, preserve provenance, apply **provisional** ranking into a Top-N list for the editor, and record run health.

Module 02 is **mostly plumbing** (provider pulls + structured inserts). It is **not** the Fit Score engine (Module 03) and **not** deep research (Module 04).

---

## 2. Ownership — what Module 02 owns

| Concern | Owned by Module 02 |
|--------|---------------------|
| Discovery intake | Yes — via `SearchProvider` |
| Write shape for new stories | Yes — `StoryDiscoveryInput` only |
| Provenance rows | Yes — `StorySource` |
| Run lifecycle | Yes — `DiscoveryRun` |
| Provider abstraction | Yes — `SearchProvider` / `RawSearchResult` |
| Provisional ranking | Yes — `DiscoveryScore` / `discovery_score` field |
| Deterministic basic deduplication | Yes (Batch 2+) |
| Discovery orchestration | Yes (Batch 2+) |
| Optional trigger route | Yes — `POST /api/discovery/run` (Batch 2+) |
| Tables conceptually | `stories` (insert as `discovered` only), `story_sources`, `discovery_runs` |

---

## 3. Non-ownership — what Module 02 must never write

Module 02 **must not** own, construct for write, or persist:

| Field / concern | Owner |
|-----------------|--------|
| `fit` / `FitScoreRef` | Module 03 |
| `fit_score` (authoritative Core §5 score) | Module 03 |
| `priority` / `recommended_priority` | Module 03 |
| `evidence_confidence` / `EvidenceConfidenceRef` | Module 04 |
| `story_evidence` table / claim taxonomy | Module 04 |
| Module 03 ranking reasons / Fit rubric | Module 03 |
| Live deep research / web_search per candidate | Module 04 (TECH SPEC honest flag) |
| Semantic / LLM clustering as the **primary** dedup path | Later (optional enhancement; not required for Batch 2) |
| Module 01 dashboard redesign, `StoryCardData`, `FindStoriesAction` UI | Module 01 (locked) |

**Compile-time invariant:** `StoryDiscoveryInput` omits `fit`, `evidence_confidence`, and `priority`.  
**Runtime invariant:** `validateStoryDiscoveryInput` rejects those keys (and `fit_score`) if present via bypass casts.

---

## 4. Discovery Score vs Module 03 Fit Score

| | **Discovery Score** (Module 02) | **Fit Score** (Module 03) |
|--|----------------------------------|---------------------------|
| Purpose | Provisional sort of raw candidates (e.g. Top 5) | Authoritative editorial Fit Score (Core §5) |
| Type | `DiscoveryScore` + optional `Story.discovery_score` | `FitScoreRef` → `Story.fit` |
| Field name | `discovery_score` | `fit_score` inside `fit` (not a Module 02 write) |
| Config | `src/discovery/config/discovery-scoring-weights.ts` | Module 03 only |
| Explainability | Optional breakdown dimensions | **Required** `reasons[]` per TECH SPEC §10 |
| May Module 03 ignore it? | Yes | N/A |

Never name, store, or display Discovery Score as `fit_score`.

---

## 5. Data models (Batch 1 — locked shapes)

Paths relative to `src/discovery/types/`.

### 5.1 `Story` (read shape)

Full row as any module may **read**, including optional downstream fields. Module 02 must not **write** downstream fields. Field list must match `src/discovery/types/story.ts`.

- Primary key field name is **`story_id`** (never `id`).
- Module 02–owned fields: `story_id`, `headline`, `summary`, `category`, `location`, `countries`, `event_time`, `latest_update`, `status`, `source_count`, `sources`, `created_at`, `updated_at`, optional `discovery_score`.
- `status: StoryStatus` is the **full** shared union from `@/src/lib/types` on the read shape.
- `countries: string[]` is required; **empty array is type-legal**.
- `discovery_score?: number` is an optional **scalar** on the story row (provisional rank for sort/display).
- Downstream optional fields: `fit?: FitScoreRef`, `evidence_confidence?: EvidenceConfidenceRef`, `priority?: Priority`.

### 5.2 `StoryDiscoveryInput` (write shape — **only** insert surface)

Strict subset of `Story`. Same field names as Module 02-owned story fields. Required write rules:

- Primary key field name is **`story_id`** (never `id`).
- `status: Extract<StoryStatus, "discovered">` — the only legal insert status.
- `source_count` must equal `sources.length`.
- `sources` must be non-empty.
- Optional `discovery_score?: number` only (not a `FitScoreRef`, not `provisional_score` on this interface).
- No `fit` / `priority` / `evidence_confidence`.

### 5.3 `StorySource`

Provenance for one observed article/source (`src/discovery/types/story-source.ts`).

- Keys: `source_id`, `story_id` (not `id`).
- `source_name: string`, `article_title: string`, `url: string`.
- `published_at: string | null`; `retrieved_at: string` (required); `author: string | null`.
- `credibility_score: number | null`.
- `source_type: SourceType` =
  `"rss" | "news_api" | "wire_service" | "official_statement" | "social_media" | "manual_entry"`.
- `credibility_classification: CredibilityClassification` =
  `"primary" | "established_press" | "regional_press" | "aggregator" | "unverified"`.

### 5.4 `DiscoveryRun`

One execution of discovery. Fields: `run_id` (not `id`), `started_at`, `completed_at: string | null`, `status`, `sources_attempted`, `sources_successful`, `candidates_found`, `candidates_after_dedup`, `errors[]`, `warnings[]`.

- `status: DiscoveryRunStatus` = `"running" | "complete" | "partial_failure" | "failed"`.
- `errors[]` element shape: `{ source_name: string, message: string, occurred_at: string }`.

### 5.5 `DiscoveryScore` / `DiscoveryScoreBreakdown` (dual representation)

- **`DiscoveryScore` object:** `story_id`, `provisional_score` (0–100), `breakdown`, `computed_at`.
- **Breakdown dimensions (0–1):** `recency`, `source_diversity`, `keyword_relevance`, `regional_relevance`, `duplicate_penalty`.
- **Weights:** `DEFAULT_DISCOVERY_SCORE_WEIGHTS` in `config/discovery-scoring-weights.ts`.
- **`Story.discovery_score` / `StoryDiscoveryInput.discovery_score`:** optional scalar `number` used for sort/display.
- `saveDiscoveryScore` persists the **object**; insert may also copy `provisional_score` onto the scalar field.
- Never use the name `fit_score` for either representation.

### 5.6 Downstream refs (read-only)

**`FitScoreRef`:** `fit_score`, `reasons[]`, `underreported_score?`, `scored_at`.

Module 03’s **HTTP/API** payload may include `story_id` and `recommended_priority` (TECH SPEC §10).
On the **story row**, priority is stored as `Story.priority?: Priority`, not inside `FitScoreRef`.

**`EvidenceConfidenceRef`:** `confirmed_count`, `likely_count`, `disputed_count`, `unknown_count`, `researched_at`
(Batch 1 has no `reported_count` field).

### 5.7 Provider types

- `RawSearchResult`: `{ headline, source_url, source_name, published_at, raw_snippet }`
- `SearchQueryOptions`: `{ since?, limit? }`
- `SearchProvider`: `providerName`, `searchStories`, `searchByCategory`, `searchByRegion`, `searchRecent`

---

## 6. Repository boundary

**File (Batch 2):** `src/discovery/repositories/story-discovery-repository.ts`

### Module 01 DB firewall (mandatory)

Module 02 may add discovery-specific persistence functions/adapters, but **must not** alter existing Module 01 database function **signatures or behavior** in `src/lib/db.ts` (`getTopStories`, `getDevelopingStories`, `getInProductionStories`, `getScheduledContent`, `getRecentlyPublished`, `getPipelineSummary`).

### Implementation constraint

`src/lib/db.ts` today is a Module 01 **read-mock** layer with no write APIs and no shared client object. Batch 2 **must not** implement discovery writes by changing those mocks’ contracts. Implement `StoryDiscoveryRepository` under `src/discovery/repositories/`. An in-memory mock store is acceptable for Batch 2. A future shared DB client may back both Module 01 reads and Module 02 writes **without** renaming or breaking Module 01 exports.

### Rules (TECH SPEC §4–§5, §7)

- Module 02 may **insert/update** only discovery-owned data.
- Module 02 may **read** upstream-needed context; it must **not** write Module 03/04 fields or tables.
- Do **not** introduce a second competing production DB product; one eventual shared client is the goal.

### 6.1 Required methods (Batch 2 contract)

```ts
interface StoryDiscoveryRepository {
  /** Insert a discovered story. Input must pass validateStoryDiscoveryInput. */
  insertDiscoveredStory(input: StoryDiscoveryInput): Promise<{ story_id: string }>;

  /** Insert provenance rows (or replace set for story_id). Each must pass validateStorySource. */
  insertStorySources(sources: StorySource[]): Promise<void>;

  /** Create a run in status "running". */
  createDiscoveryRun(run: DiscoveryRun): Promise<void>;

  /** Update run counts/status/errors when finished or failed. */
  updateDiscoveryRun(run: DiscoveryRun): Promise<void>;

  /** Optional: persist provisional score breakdown + scalar on the story. */
  saveDiscoveryScore(score: DiscoveryScore): Promise<void>;

  /** Optional reads for orchestration / idempotency. */
  getDiscoveryRun(run_id: string): Promise<DiscoveryRun | null>;
  listRecentDiscoveredStories(limit: number): Promise<Story[]>;
}
```

### 6.2 Forbidden methods

No repository method may accept or write: `fit`, `fit_score`, `priority`, `evidence_confidence`, or any `story_evidence` payload.

### 6.3 Persistence mapping note

Batch 1 embeds `sources: StorySource[]` on the story type. Storage may use:

- related `story_sources` rows keyed by `story_id`, and/or
- a documented JSON column,

but the **public write API** remains `StoryDiscoveryInput.sources`. Choose one mapping in Batch 2 and document it in the repository implementation comments without changing the locked input type.

---

## 7. Mapping: `RawSearchResult` → domain objects

Provider output is intentionally thinner than domain types. Orchestration (Batch 2) owns mapping.

### 7.1 `RawSearchResult` → `StorySource`

| StorySource field | Source |
|-------------------|--------|
| `source_id` | Generated by Module 02 (UUID or deterministic hash of url+run_id) |
| `story_id` | Parent story id after allocation |
| `source_name` | `RawSearchResult.source_name` |
| `article_title` | `RawSearchResult.headline` |
| `url` | `RawSearchResult.source_url` (must be valid URL) |
| `published_at` | `RawSearchResult.published_at` |
| `retrieved_at` | Orchestrator clock (ISO) |
| `author` | `null` unless provider later extended |
| `source_type` | Set by concrete provider (e.g. `"rss"` / `"news_api"`) |
| `credibility_classification` | Default `"unverified"` until a classifier exists |
| `credibility_score` | `null` until a classifier exists |

`raw_snippet` is **not** a `StorySource` field; use it when building `Story.summary` / heuristics only.

### 7.2 `RawSearchResult[]` → `StoryDiscoveryInput`

| StoryDiscoveryInput field | Rule |
|---------------------------|------|
| `story_id` | Generated by Module 02 |
| `headline` | Primary/canonical result headline (post-dedup representative) |
| `summary` | From `raw_snippet` or short derived text; non-empty |
| `category` | From provider category search context, heuristic, or `"Uncategorized"` |
| `location` | From region search context or `"Global"` until geo enrichment exists |
| `countries` | `string[]` required by type; may be `[]` if unknown. Do not invent ISO codes in Batch 2. Prefer populated values when known. |
| `event_time` | `null` unless known |
| `latest_update` | Max of source `published_at` / `retrieved_at` |
| `status` | Always `"discovered"` |
| `sources` | Mapped `StorySource[]` (non-empty) |
| `source_count` | `sources.length` |
| `created_at` / `updated_at` | Orchestrator clock |
| `discovery_score` | Optional; set after scoring |

---

## 8. Deduplication behavior

### 8.1 Batch 2 (in scope): deterministic basic dedup

Before insert, cluster/drop near-duplicates using **non-LLM** rules, for example:

1. Normalize URL (scheme/host/path, strip tracking params).
2. Exact or normalized headline equality (casefold, whitespace collapse).
3. Optional: simple token overlap threshold on headline.

**Metrics:**

- `candidates_found` — raw count after provider merge, before dedup.
- `candidates_after_dedup` — count after deterministic dedup (`<= candidates_found`).
- `DiscoveryScoreBreakdown.duplicate_penalty` — higher when near-duplicates were collapsed into this cluster.

### 8.2 Later batches (out of scope for Batch 2)

- Claude / semantic clustering of near-identical stories across sources (allowed by TECH SPEC §10 as Claude’s limited role in Module 02, but **not** required for Batch 2).

---

## 9. DiscoveryRun failure states

| `status` | Meaning |
|----------|---------|
| `running` | Run started; not finished |
| `complete` | All attempted providers/sources succeeded; usable candidates may be zero or more (prefer documenting “complete with zero candidates” via counts, not `failed`, unless product policy says otherwise) |
| `partial_failure` | At least one provider/source failed **and** at least one candidate was produced |
| `failed` | No usable candidates produced (typically all providers failed or all results invalid) |

`errors[]`: structured `{ source_name, message, occurred_at }`.  
`warnings[]`: non-fatal strings (e.g. “skipped invalid URL”).

Invariant: `sources_successful <= sources_attempted`.  
Invariant: `candidates_after_dedup <= candidates_found`.

---

## 10. Validation responsibilities

**File:** `src/discovery/validation/story-validation.ts`

Batch 1 **locked** exports: `validateStoryDiscoveryInput`, `validateStorySource`, `validateDiscoveryRun`.

| Function | Responsibility |
|----------|----------------|
| `validateStoryDiscoveryInput` | Structural insert checks + ownership guard for forbidden keys |
| `validateStorySource` | Per-source structural checks |
| `validateDiscoveryRun` | Run structural checks |

**Known Batch 1 limits (accepted):**

- Does not recursively validate each `sources[]` entry inside `validateStoryDiscoveryInput`.
- Does not enum-check `source_type`, `credibility_classification`, or `DiscoveryRun.status`.
- Allows `countries: []`.

**Batch 2 requirements:**

- Orchestrator **shall** call the locked validators **before** repository writes.
- Orchestrator **should** invoke `validateStorySource` for every element of `sources`.
- Enum tightening is Batch 2+ and must not require editing Batch 1 types unless a separate unlock is agreed.
- Do not rename Batch 1 export names.

---

## 11. Ownership invariants (summary)

1. Only `StoryDiscoveryInput` is used for Module 02 inserts.  
2. `status` on insert is always `"discovered"`.  
3. No write path sets `fit`, `fit_score`, `priority`, or `evidence_confidence`.  
4. Discovery Score ≠ Fit Score (names, types, owners, configs differ).  
5. Providers return `RawSearchResult` only; domain construction happens in orchestration.  
6. Modules communicate via DB outputs, not by calling each other’s run routes (TECH SPEC §5, §7).  
7. Module 01 remains the place that **triggers** discovery (button/schedule); Module 02 owns the **run implementation**.

---

## 12. API boundary

**Route (Batch 2, optional but recommended):** `POST /api/discovery/run`

- Aligns with TECH SPEC §5: `/api/{module}/{action}`.
- Body: optional `{ query?, category?, region?, since?, limit? }` (final schema in same commit as implementation).
- Behavior: create `DiscoveryRun` → providers → map → dedup → validate → persist → score → finalize run.
- Response: `{ run_id, status, candidates_after_dedup, errors[] }` (exact JSON frozen in this contract when implemented).

**Module 01 wire-up:** `FindStoriesAction` currently simulates delay. Wiring `fetch('/api/discovery/run')` touches a Module 01 file and requires **explicit approval** (Module 01 is locked). Batch 2 may ship the route without changing the button.

**Schedule trigger:** every ~2 hours (TECH SPEC §9) — infrastructure later; same orchestrator entrypoint.

---

## 13. Batch scope

### 13.1 Batch 1 (LOCKED — done)

- Types under `src/discovery/types/`
- `SearchProvider` interface
- Scoring **weights** config (no calculator)
- Validation helpers
- This contract document (canonical)

### 13.2 Batch 2 (IN SCOPE — do not implement until approved)

- `StoryDiscoveryRepository` interface + implementation (mock DB acceptable if Postgres not ready)
- ≥1 concrete `SearchProvider` (fixture/mock provider is acceptable)
- Orchestrator service
- Deterministic basic dedup
- Discovery Score **calculation** function using locked weights
- Optional `POST /api/discovery/run`
- Extend validation composition as needed
- Unit tests for mapping, dedup, ownership invariants, score pure function

### 13.3 OUT OF SCOPE (later)

- Module 03 Fit Score / Claude ranking
- Module 04 research / live web_search per candidate
- LLM semantic dedup as required path
- Module 01 dashboard redesign or `StoryCardData` changes
- Real multi-vendor production news accounts without env-gated keys
- Discover page UI (`/discover` placeholder remains Module 01 routing)
- Writing `story_evidence`, scripts, or any downstream tables

---

## 14. Handoff to Module 03

1. Module 02 leaves rows with `status: "discovered"` and optional `discovery_score`.  
2. Module 03 **reads** those rows (DB), computes Fit Score + `reasons[]` + `recommended_priority`.  
3. Module 03 **writes** via its **own** repository — not `StoryDiscoveryRepository`.  
4. Module 03 may use `discovery_score` as one weak signal or ignore it.  
5. After Module 03, status typically advances (e.g. toward `"ranked"`) under Module 03’s contract — Module 02 does not pre-set later statuses.

---

## 15. File map

### Present on `main` (Batch 1)

```
src/discovery/types/index.ts
src/discovery/types/story.ts
src/discovery/types/story-source.ts
src/discovery/types/discovery-run.ts
src/discovery/types/discovery-score.ts
src/discovery/types/downstream-refs.ts
src/discovery/providers/search-provider.ts
src/discovery/config/discovery-scoring-weights.ts
src/discovery/validation/story-validation.ts
```

### Missing on `main` until this commit

```
docs/module-contracts/02-story-discovery.md   ← this file
```

### Expected Batch 2 additions (not created yet)

```
src/discovery/repositories/story-discovery-repository.ts
src/discovery/providers/*-provider.ts          (concrete)
src/discovery/services/discovery-orchestrator.ts  (name flexible)
src/discovery/scoring/compute-discovery-score.ts  (name flexible)
app/api/discovery/run/route.ts                 (optional)
```

---

## 16. Dependencies

No new runtime dependencies required for Batch 1 or Batch 2 core path beyond existing Next.js stack. External news SDKs only if a concrete live provider is added (env-gated).

---

## 17. Change control

- Batch 1 types and this ownership model are **locked**.  
- Contract changes ship in the **same commit** as implementation changes (TECH SPEC §5).  
- Module 01 files must not be modified without explicit unlock.
