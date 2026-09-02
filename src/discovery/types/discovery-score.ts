/**
 * Module 02's PROVISIONAL ranking score — used only to sort discovered
 * candidates into the Top 5 shown to the editor. This is explicitly NOT
 * the Core Section 5 Trendulon Fit Score (see FitScoreRef in
 * downstream-refs.ts, owned exclusively by Module 03).
 *
 * Kept structurally separate — different type name, different field name
 * on Story (`discovery_score`, not `fit_score`), different config file —
 * so nothing downstream can mistake one for the other, and Module 03 can
 * replace, enrich, or supersede this ranking later without touching
 * Module 02's code.
 *
 * The calculation itself is out of scope for this batch — only the data
 * shape and config exist so far.
 */

export interface DiscoveryScoreBreakdown {
  recency: number; // 0-1, how fresh the story is
  source_diversity: number; // 0-1, distinct outlets covering it
  keyword_relevance: number; // 0-1, match against Core's coverage areas
  regional_relevance: number; // 0-1, Africa/Nigeria weighting signal
  duplicate_penalty: number; // 0-1, subtracted for near-duplicate candidates already seen
}

export interface DiscoveryScore {
  story_id: string;
  provisional_score: number; // 0-100, weighted combination of the breakdown below
  breakdown: DiscoveryScoreBreakdown;
  computed_at: string; // ISO timestamp
}
