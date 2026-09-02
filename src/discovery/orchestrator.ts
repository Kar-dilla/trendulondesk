/**
 * orchestrator.ts — Module 02's top-level discovery entry point.
 *
 * Wires together: SearchProvider -> deduplicateResults -> Story/StorySource
 * construction -> validation -> calculateDiscoveryScore -> repository
 * persistence, and records the outcome as a DiscoveryRun.
 *
 * Scope: finding and persisting candidate stories. No editorial judgment.
 */

import type { StoryDiscoveryInput } from "./types/story";
import type { DiscoveryRun, DiscoveryRunStatus } from "./types/discovery-run";
import type { StorySource } from "./types/story-source";
import {
  validateStoryDiscoveryInput,
  validateStorySource,
} from "./validation/story-validation";
import { discoveryRepository } from "./repositories/story-discovery-repository";
import { deduplicateResults, type DedupResult } from "./dedup";
import { calculateDiscoveryScore } from "./discovery-score";
import { MockSearchProvider } from "./providers/mock-search-provider";
import type {
  SearchProvider,
  RawSearchResult,
  SearchQueryOptions,
} from "./providers/search-provider";

export interface RunDiscoveryOptions {
  query?: string;
  category?: string;
  region?: string;
  since?: string;
  limit?: number;
  provider?: SearchProvider;
}

export async function runDiscovery(
  options: RunDiscoveryOptions
): Promise<DiscoveryRun> {
  const provider = options.provider ?? new MockSearchProvider();

  const run: DiscoveryRun = {
    run_id: crypto.randomUUID(),
    started_at: new Date().toISOString(),
    completed_at: null,
    status: "running",
    sources_attempted: 1,
    sources_successful: 0,
    candidates_found: 0,
    candidates_after_dedup: 0,
    errors: [],
    warnings: [],
  };

  discoveryRepository.createDiscoveryRun(run);

  const searchOptions: SearchQueryOptions = {
    since: options.since,
    limit: options.limit,
  };

  let rawResults: RawSearchResult[] = [];
  let searchFailed = false;

  try {
    if (options.query) {
      rawResults = await provider.searchStories(options.query, searchOptions);
    } else if (options.category) {
      rawResults = await provider.searchByCategory(
        options.category,
        searchOptions
      );
    } else if (options.region) {
      rawResults = await provider.searchByRegion(
        options.region,
        searchOptions
      );
    } else {
      rawResults = await provider.searchRecent(searchOptions);
    }
  } catch (err) {
    searchFailed = true;
    run.errors.push({
      source_name: provider.providerName,
      message: err instanceof Error ? err.message : String(err),
      occurred_at: new Date().toISOString(),
    });
  }

  const dedupResult: DedupResult = deduplicateResults(rawResults);
  run.candidates_found = dedupResult.candidatesFound;
  run.candidates_after_dedup = dedupResult.candidatesAfterDedup;

  const duplicatePenalty =
    dedupResult.candidatesFound > 0
      ? dedupResult.duplicatesRemoved / dedupResult.candidatesFound
      : 0;

  let persistedCount = 0;

  for (const rawResult of dedupResult.uniqueResults) {
    const storyId = crypto.randomUUID();
    const nowIso = new Date().toISOString();

    const source: StorySource = {
      source_id: crypto.randomUUID(),
      story_id: storyId,
      source_name: rawResult.source_name,
      article_title: rawResult.headline,
      url: rawResult.source_url,
      published_at: rawResult.published_at,
      retrieved_at: nowIso,
      author: null,
      source_type: "news_api",
      credibility_classification: "unverified",
      credibility_score: null,
    };

    const storyInput: StoryDiscoveryInput = {
      story_id: storyId,
      headline: rawResult.headline,
      summary: rawResult.raw_snippet,
      category: options.category ?? "General",
      location: options.region ?? "Global",
      countries: [],
      event_time: rawResult.published_at,
      latest_update: rawResult.published_at ?? nowIso,
      status: "discovered",
      source_count: 1,
      sources: [source],
      created_at: nowIso,
      updated_at: nowIso,
    };

    const storyValidation = validateStoryDiscoveryInput(storyInput);
    const sourceValidation = validateStorySource(source);

    if (!storyValidation.valid || !sourceValidation.valid) {
      const message = [...storyValidation.errors, ...sourceValidation.errors]
        .join("; ");
      run.errors.push({
        source_name: rawResult.source_name,
        message,
        occurred_at: new Date().toISOString(),
      });
      continue;
    }

    try {
      const score = calculateDiscoveryScore(
        storyInput,
        [source],
        duplicatePenalty
      );
      storyInput.discovery_score = score.provisional_score;

      discoveryRepository.insertDiscoveredStory(storyInput);
      discoveryRepository.insertStorySources([source]);
      discoveryRepository.saveDiscoveryScore(score);

      persistedCount += 1;
    } catch (err) {
      run.errors.push({
        source_name: rawResult.source_name,
        message: err instanceof Error ? err.message : String(err),
        occurred_at: new Date().toISOString(),
      });
    }
  }

  run.sources_successful = searchFailed ? 0 : 1;

  let finalStatus: DiscoveryRunStatus;
  if (persistedCount === 0) {
    finalStatus = "failed";
  } else if (
    !searchFailed &&
    persistedCount === dedupResult.uniqueResults.length
  ) {
    finalStatus = "complete";
  } else {
    finalStatus = "partial_failure";
  }

  run.status = finalStatus;
  run.completed_at = new Date().toISOString();

  discoveryRepository.updateDiscoveryRun(run);

  return run;
}
