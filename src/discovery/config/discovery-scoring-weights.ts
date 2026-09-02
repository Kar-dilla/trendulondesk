import type { DiscoveryScoreBreakdown } from "../types/discovery-score";

/**
 * Central config for Module 02's provisional Discovery Score weights.
 * This is NOT the Core Section 5 Fit Score rubric — that configuration
 * (if/when it exists) belongs to Module 03, in Module 03's own code, not
 * here. See discovery-score.ts for the full ownership rationale.
 *
 * Kept as one exported object so weights are never scattered into
 * components.
 *
 * The weighted combination is NOT computed here — this batch only
 * defines the config shape and defaults. The calculation function is
 * explicitly out of scope for Batch 1.
 */
export type DiscoveryScoreWeights = Record<keyof DiscoveryScoreBreakdown, number>;

export const DEFAULT_DISCOVERY_SCORE_WEIGHTS: DiscoveryScoreWeights = {
  recency: 0.25,
  source_diversity: 0.2,
  keyword_relevance: 0.25,
  regional_relevance: 0.2,
  duplicate_penalty: 0.1,
};
