/**
 * discovery-score.ts — computes Module 02's PROVISIONAL Discovery Score.
 *
 * This is a ranking aid for sorting candidates into the Top 5 shown to an
 * editor. It is explicitly NOT the Core Section 5 Trendulon Fit Score,
 * which is owned exclusively by Module 03 — see
 * src/discovery/types/discovery-score.ts for the full ownership
 * rationale. This file does not build, reference, or approximate that
 * score.
 */

import type { StoryDiscoveryInput } from "./types/story";
import type {
  DiscoveryScore,
  DiscoveryScoreBreakdown,
} from "./types/discovery-score";
import type { StorySource } from "./types/story-source";
import { DEFAULT_DISCOVERY_SCORE_WEIGHTS } from "./config/discovery-scoring-weights";

const RECENCY_DECAY_WINDOW_HOURS = 72;

const KEYWORD_RELEVANCE_TERMS = [
  "conflict",
  "disaster",
  "crisis",
  "flood",
  "earthquake",
  "war",
  "humanitarian",
  "geopolitics",
  "protest",
  "election",
  "coup",
];

const KEYWORD_RELEVANCE_MATCH_CAP = 5;

const SOURCE_DIVERSITY_CAP = 5;

const HIGH_REGIONAL_RELEVANCE_TERMS = [
  "africa",
  "nigeria",
  "congo",
  "sudan",
  "sahel",
  "mali",
  "ethiopia",
  "somalia",
  "darfur",
];

const MID_REGIONAL_RELEVANCE_TERMS = [
  "middle east",
  "ukraine",
  "gaza",
  "yemen",
];

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}

function scoreRecency(latestUpdate: string): number {
  const updatedTime = Date.parse(latestUpdate);
  if (Number.isNaN(updatedTime)) {
    return 0;
  }

  const hoursSinceUpdate = (Date.now() - updatedTime) / (1000 * 60 * 60);
  if (hoursSinceUpdate <= 0) {
    return 1;
  }

  const decayed = 1 - hoursSinceUpdate / RECENCY_DECAY_WINDOW_HOURS;
  return clamp01(decayed);
}

function scoreSourceDiversity(sources: StorySource[]): number {
  const distinctNames = new Set(
    sources.map((source) => source.source_name.trim().toLowerCase())
  );
  return clamp01(distinctNames.size / SOURCE_DIVERSITY_CAP);
}

function scoreKeywordRelevance(headline: string, summary: string): number {
  const haystack = `${headline} ${summary}`.toLowerCase();
  const matchCount = KEYWORD_RELEVANCE_TERMS.reduce(
    (count, term) => (haystack.includes(term) ? count + 1 : count),
    0
  );
  return clamp01(matchCount / KEYWORD_RELEVANCE_MATCH_CAP);
}

function scoreRegionalRelevance(location: string): number {
  const normalizedLocation = location.toLowerCase();

  const isHighRelevance = HIGH_REGIONAL_RELEVANCE_TERMS.some((term) =>
    normalizedLocation.includes(term)
  );
  if (isHighRelevance) {
    return 1.0;
  }

  const isMidRelevance = MID_REGIONAL_RELEVANCE_TERMS.some((term) =>
    normalizedLocation.includes(term)
  );
  if (isMidRelevance) {
    return 0.7;
  }

  return 0.3;
}

export function calculateDiscoveryScore(
  story: StoryDiscoveryInput,
  sources: StorySource[],
  duplicatePenalty: number
): DiscoveryScore {
  const weights = DEFAULT_DISCOVERY_SCORE_WEIGHTS;

  const breakdown: DiscoveryScoreBreakdown = {
    recency: scoreRecency(story.latest_update),
    source_diversity: scoreSourceDiversity(sources),
    keyword_relevance: scoreKeywordRelevance(story.headline, story.summary),
    regional_relevance: scoreRegionalRelevance(story.location),
    duplicate_penalty: clamp01(duplicatePenalty),
  };

  const weightedSum =
    breakdown.recency * weights.recency +
    breakdown.source_diversity * weights.source_diversity +
    breakdown.keyword_relevance * weights.keyword_relevance +
    breakdown.regional_relevance * weights.regional_relevance -
    breakdown.duplicate_penalty * weights.duplicate_penalty;

  const provisional_score = Math.round(
    Math.max(0, Math.min(100, weightedSum * 100))
  );

  return {
    story_id: story.story_id,
    provisional_score,
    breakdown,
    computed_at: new Date().toISOString(),
  };
}
