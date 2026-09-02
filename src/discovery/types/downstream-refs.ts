/**
 * Read-only reference shapes for fields other modules own on the `stories`
 * row. Module 02 may read these once downstream modules have run, but must
 * never construct or write them — see story.ts's `StoryDiscoveryInput`,
 * which omits these fields entirely at the type level.
 *
 * These intentionally mirror the documented output shapes in
 * TRENDULON_TECH_SPEC.md Section 10, so there's one definition of "what
 * Module 03/04 produce" instead of each module re-describing it.
 */

/**
 * Module 03 (Trendulon Ranking) output, per TECH SPEC Section 10:
 * `{story_id, fit_score, reasons[], recommended_priority}`.
 *
 * `underreported_score` is surfaced here — not as a top-level Story field
 * — because it is one of the Fit Score dimensions from Core Section 5
 * (`underreportedValue`). It is Module 03's output, not something
 * Module 02 computes independently of the Fit Score.
 */
export interface FitScoreRef {
  fit_score: number; // 0-100, Core Section 5 Fit Score — authoritative, Module 03 only
  reasons: string[]; // required per-dimension explainability, TECH SPEC Section 10
  underreported_score?: number; // the underreportedValue dimension, surfaced for convenience
  scored_at: string; // ISO timestamp of the Module 03 run that produced this
}

/**
 * Module 04 (Story Room) confidence taxonomy rollup, per TECH SPEC
 * Section 10 / Core Section 7: CONFIRMED / LIKELY / REPORTED / DISPUTED /
 * UNKNOWN. Only a summary is mirrored onto the Story row here — the full
 * per-claim evidence lives in Module 04's own `story_evidence` table
 * (TECH SPEC Section 4), which this module does not read or model.
 */
export interface EvidenceConfidenceRef {
  confirmed_count: number;
  likely_count: number;
  disputed_count: number;
  unknown_count: number;
  researched_at: string; // ISO timestamp of the Module 04 run
}
