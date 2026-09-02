import type { StoryStatus, Priority } from "@/src/lib/types";
import type { FitScoreRef, EvidenceConfidenceRef } from "./downstream-refs";
import type { StorySource } from "./story-source";

/**
 * Canonical Story model — owned by Module 02 (Discovery), per
 * TRENDULON_TECH_SPEC.md Section 4: "`stories` — one row per candidate
 * story. Created by Module 02, updated by every downstream module as it
 * moves through the pipeline."
 *
 * This is the READ shape — the full row as any module may read it,
 * including fields owned and written by downstream modules. Module 02
 * must never construct or write the downstream-owned fields below; see
 * `StoryDiscoveryInput` below for Module 02's actual write surface, and
 * `downstream-refs.ts` for why those fields are kept separate.
 *
 * Field-level ownership is restated in
 * docs/module-contracts/02-story-discovery.md.
 */
export interface Story {
  // ---- Owned + written by Module 02 ----
  story_id: string;
  headline: string;
  summary: string;
  category: string; // e.g. "Politics", "Conflict", "Tech" — free text pending a shared enum
  location: string; // e.g. "Nigeria", "Global", "West Africa"
  countries: string[]; // as discovered; not normalized to ISO codes in this batch
  event_time: string | null; // ISO timestamp of when the event happened, if known at discovery time
  latest_update: string; // ISO timestamp of the most recent source update seen
  status: StoryStatus; // shared enum from src/lib/types.ts — Module 02 only ever writes "discovered"
  source_count: number; // derived: sources.length at save time
  sources: StorySource[]; // full provenance list, see story-source.ts
  created_at: string; // ISO timestamp, set once on insert
  updated_at: string; // ISO timestamp, bumped by whichever module last wrote the row

  // ---- Module 02's own provisional ranking signal ----
  // Sorts the Top-5 candidates. NOT the Core Section 5 Fit Score.
  // See discovery-score.ts.
  discovery_score?: number;

  // ---- Owned and written ONLY by downstream modules — read-only here ----
  // Module 02 may read these (e.g. to show "already ranked" in a debug
  // view) but must never construct a Story with these set. The
  // repository interface has no method that lets it write them.
  fit?: FitScoreRef; // Module 03 — authoritative Trendulon Fit Score
  evidence_confidence?: EvidenceConfidenceRef; // Module 04 — Story Room confidence rollup
  priority?: Priority; // Module 03's recommended_priority; Module 02 never sets it
}

/**
 * Module 02's actual write surface. This is the ONLY shape Module 02's
 * repository implementation is allowed to insert. It's a strict subset of
 * `Story` — `fit`, `evidence_confidence`, and `priority` don't exist on
 * this type at all, so it's a compile-time error (not just a convention)
 * for Module 02 code to try to set them.
 *
 * `status` is narrowed to the one value Module 02 is allowed to write on
 * insert — later modules transition status forward; Module 02 doesn't
 * pre-guess later stages.
 */
export interface StoryDiscoveryInput {
  story_id: string;
  headline: string;
  summary: string;
  category: string;
  location: string;
  countries: string[];
  event_time: string | null;
  latest_update: string;
  status: Extract<StoryStatus, "discovered">;
  source_count: number;
  sources: StorySource[];
  created_at: string;
  updated_at: string;
  discovery_score?: number;
}
