import type { StoryDiscoveryInput } from "../types/story";
import type { StorySource } from "../types/story-source";
import type { DiscoveryRun } from "../types/discovery-run";

/**
 * Lightweight structural validation for Module 02's own data. No new
 * dependency added — the project currently has none beyond
 * next/react/tailwind — so this is hand-written rather than pulling in a
 * schema library. Scope is deliberately narrow: "is this structurally
 * valid to insert," not a full business-rule engine.
 */

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

function nonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isIsoTimestamp(value: unknown): value is string {
  if (typeof value !== "string") return false;
  const parsed = new Date(value);
  return !Number.isNaN(parsed.getTime());
}

export function validateStoryDiscoveryInput(
  input: StoryDiscoveryInput
): ValidationResult {
  const errors: string[] = [];

  if (!nonEmptyString(input.story_id)) errors.push("story_id is required");
  if (!nonEmptyString(input.headline)) errors.push("headline is required");
  if (!nonEmptyString(input.summary)) errors.push("summary is required");
  if (!nonEmptyString(input.category)) errors.push("category is required");
  if (!nonEmptyString(input.location)) errors.push("location is required");
  if (!Array.isArray(input.countries)) {
    errors.push("countries must be an array");
  }
  if (input.event_time !== null && !isIsoTimestamp(input.event_time)) {
    errors.push("event_time must be an ISO timestamp or null");
  }
  if (!isIsoTimestamp(input.latest_update)) {
    errors.push("latest_update must be an ISO timestamp");
  }
  if (input.status !== "discovered") {
    errors.push(
      'status must be "discovered" — Module 02 may not write any other status'
    );
  }
  if (typeof input.source_count !== "number" || input.source_count < 0) {
    errors.push("source_count must be a non-negative number");
  }
  if (!Array.isArray(input.sources) || input.sources.length === 0) {
    errors.push("sources must be a non-empty array — every Story needs provenance");
  }
  if (Array.isArray(input.sources) && input.sources.length !== input.source_count) {
    errors.push("source_count must match sources.length");
  }
  if (!isIsoTimestamp(input.created_at)) {
    errors.push("created_at must be an ISO timestamp");
  }
  if (!isIsoTimestamp(input.updated_at)) {
    errors.push("updated_at must be an ISO timestamp");
  }
  if (input.discovery_score !== undefined) {
    if (
      typeof input.discovery_score !== "number" ||
      input.discovery_score < 0 ||
      input.discovery_score > 100
    ) {
      errors.push("discovery_score must be a number between 0 and 100");
    }
  }

  // Structural ownership guard: StoryDiscoveryInput has no fit/priority/
  // evidence_confidence fields at the type level, so this only catches
  // something constructed via `as any` or plain JS bypassing TypeScript.
  const forbiddenKeys = ["fit", "evidence_confidence", "priority", "fit_score"];
  for (const key of forbiddenKeys) {
    if (key in (input as unknown as Record<string, unknown>)) {
      errors.push(`"${key}" is owned by a downstream module — Module 02 must not set it`);
    }
  }

  return { valid: errors.length === 0, errors };
}

export function validateStorySource(source: StorySource): ValidationResult {
  const errors: string[] = [];

  if (!nonEmptyString(source.source_id)) errors.push("source_id is required");
  if (!nonEmptyString(source.story_id)) errors.push("story_id is required");
  if (!nonEmptyString(source.source_name)) errors.push("source_name is required");
  if (!nonEmptyString(source.article_title)) errors.push("article_title is required");
  if (!nonEmptyString(source.url)) {
    errors.push("url is required");
  } else {
    try {
      // eslint-disable-next-line no-new
      new URL(source.url);
    } catch {
      errors.push("url must be a valid URL");
    }
  }
  if (source.published_at !== null && !isIsoTimestamp(source.published_at)) {
    errors.push("published_at must be an ISO timestamp or null");
  }
  if (!isIsoTimestamp(source.retrieved_at)) {
    errors.push("retrieved_at must be an ISO timestamp");
  }
  if (
    source.credibility_score !== null &&
    (typeof source.credibility_score !== "number" ||
      source.credibility_score < 0 ||
      source.credibility_score > 100)
  ) {
    errors.push("credibility_score must be null or a number between 0 and 100");
  }

  return { valid: errors.length === 0, errors };
}

export function validateDiscoveryRun(run: DiscoveryRun): ValidationResult {
  const errors: string[] = [];

  if (!nonEmptyString(run.run_id)) errors.push("run_id is required");
  if (!isIsoTimestamp(run.started_at)) {
    errors.push("started_at must be an ISO timestamp");
  }
  if (run.completed_at !== null && !isIsoTimestamp(run.completed_at)) {
    errors.push("completed_at must be an ISO timestamp or null");
  }
  if (run.sources_attempted < 0) errors.push("sources_attempted must be non-negative");
  if (run.sources_successful < 0) errors.push("sources_successful must be non-negative");
  if (run.sources_successful > run.sources_attempted) {
    errors.push("sources_successful cannot exceed sources_attempted");
  }
  if (run.candidates_after_dedup > run.candidates_found) {
    errors.push("candidates_after_dedup cannot exceed candidates_found");
  }

  return { valid: errors.length === 0, errors };
}
