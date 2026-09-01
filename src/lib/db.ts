import { StoryCardData } from "./types";
import {
  MOCK_HIGH_PRIORITY,
  MOCK_DEVELOPING,
  MOCK_IN_PRODUCTION,
  MOCK_SCHEDULED,
  MOCK_RECENTLY_PUBLISHED,
  PIPELINE_SUMMARY,
} from "./mock-data";

/**
 * Shared DB wrapper — /src/lib/db.ts
 *
 * Per TECH SPEC Section 5 (API CONTRACTS): external calls (news sources,
 * Claude API) live behind a thin wrapper in /src/lib so retry logic, rate
 * limiting, and error handling are written once. This is that wrapper's DB
 * counterpart. No Postgres/Supabase client exists yet in this build — every
 * function below is a MOCK implementation with the real function signature
 * a future module should keep when it swaps in a real query.
 *
 * PLACEHOLDER — NOT REAL. Function names/signatures are the contract other
 * modules integrate against (see docs/module-contracts/01-dashboard.md) —
 * unchanged from the prior version of this module. Only the mock data
 * behind them was reorganized for the newsroom-hierarchy redesign
 * (HIGH PRIORITY / DEVELOPING / IN PRODUCTION / SCHEDULED / PUBLISHED).
 */

const MOCK_LATENCY_MS = 250;

async function simulateFetch<T>(data: T): Promise<T> {
  await new Promise((resolve) => setTimeout(resolve, MOCK_LATENCY_MS));
  return data;
}

// TODO(Module 03): replace with a query for the highest-fit_score stories
// that are pending_review or otherwise need editorial attention now.
export async function getTopStories(): Promise<StoryCardData[]> {
  return simulateFetch(MOCK_HIGH_PRIORITY);
}

// TODO(Module 04/05/06): replace with a query for stories currently in
// in_research / angle_selected / scripting / ranked status.
export async function getDevelopingStories(): Promise<StoryCardData[]> {
  return simulateFetch(MOCK_DEVELOPING);
}

// TODO(Module 09/10): replace with a query for status = 'in_production'.
export async function getInProductionStories(): Promise<StoryCardData[]> {
  return simulateFetch(MOCK_IN_PRODUCTION);
}

// TODO(Module 10/11): replace with a query for status = 'scheduled'.
export async function getScheduledContent(): Promise<StoryCardData[]> {
  return simulateFetch(MOCK_SCHEDULED);
}

// TODO(Module 11): replace with a query joining `posts` for the most
// recent published entries.
export async function getRecentlyPublished(): Promise<StoryCardData[]> {
  return simulateFetch(MOCK_RECENTLY_PUBLISHED);
}

// TODO(all modules): replace with real aggregate counts once the pipeline
// is producing real rows.
export async function getPipelineSummary() {
  return simulateFetch(PIPELINE_SUMMARY);
}
