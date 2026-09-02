import { discoveryRepository } from "../repositories/story-discovery-repository";
import type { StoryDiscoveryInput } from "../types/story";
import type { StorySource } from "../types/story-source";
import type { DiscoveryRun } from "../types/discovery-run";
import type { DiscoveryScore } from "../types/discovery-score";

type RepositoryInternals = {
  stories: Map<string, unknown>;
  sources: Map<string, unknown>;
  runs: Map<string, unknown>;
  scores: Map<string, unknown>;
};

function internals(): RepositoryInternals {
  return discoveryRepository as unknown as RepositoryInternals;
}

beforeEach(() => {
  const repo = internals();
  repo.stories.clear();
  repo.sources.clear();
  repo.runs.clear();
  repo.scores.clear();
});

function buildSource(overrides: Partial<StorySource> = {}): StorySource {
  return {
    source_id: "src-1",
    story_id: "story-1",
    source_name: "Reuters",
    article_title: "Headline",
    url: "https://example.com/a",
    published_at: null,
    retrieved_at: "2026-08-01T00:00:00.000Z",
    author: null,
    source_type: "news_api",
    credibility_classification: "unverified",
    credibility_score: null,
    ...overrides,
  };
}

function buildStoryInput(overrides: Partial<StoryDiscoveryInput> = {}): StoryDiscoveryInput {
  return {
    story_id: "story-1",
    headline: "Headline",
    summary: "Summary",
    category: "Conflict",
    location: "Nigeria",
    countries: ["NG"],
    event_time: null,
    latest_update: "2026-08-01T00:00:00.000Z",
    status: "discovered",
    source_count: 1,
    sources: [buildSource()],
    created_at: "2020-01-01T00:00:00.000Z",
    updated_at: "2020-01-01T00:00:00.000Z",
    ...overrides,
  };
}

function buildRun(overrides: Partial<DiscoveryRun> = {}): DiscoveryRun {
  return {
    run_id: "run-1",
    started_at: "2026-08-01T00:00:00.000Z",
    completed_at: null,
    status: "running",
    sources_attempted: 1,
    sources_successful: 0,
    candidates_found: 0,
    candidates_after_dedup: 0,
    errors: [],
    warnings: [],
    ...overrides,
  };
}

function buildScore(overrides: Partial<DiscoveryScore> = {}): DiscoveryScore {
  return {
    story_id: "story-1",
    provisional_score: 42,
    breakdown: {
      recency: 0.5,
      source_diversity: 0.2,
      keyword_relevance: 0.1,
      regional_relevance: 1,
      duplicate_penalty: 0,
    },
    computed_at: "2026-08-01T00:00:00.000Z",
    ...overrides,
  };
}

describe("InMemoryStoryDiscoveryRepository", () => {
  it("insertDiscoveredStory persists the story and returns it", () => {
    const input = buildStoryInput({ story_id: "story-a" });
    const returned = discoveryRepository.insertDiscoveredStory(input);
    expect(returned.story_id).toBe("story-a");
    expect(returned.headline).toBe(input.headline);
    expect(returned.created_at).toBeTruthy();
    expect(returned.updated_at).toBeTruthy();
    const stored = internals().stories.get("story-a");
    expect(stored).toEqual(returned);
  });

  it("insertStorySources persists sources for a story", () => {
    const sourceA = buildSource({ source_id: "src-a", story_id: "story-a" });
    const sourceB = buildSource({ source_id: "src-b", story_id: "story-a" });
    discoveryRepository.insertStorySources([sourceA]);
    discoveryRepository.insertStorySources([sourceB]);
    const stored = internals().sources.get("story-a") as StorySource[];
    expect(stored).toHaveLength(2);
    expect(stored.map((s) => s.source_id)).toEqual(["src-a", "src-b"]);
  });

  it("saveDiscoveryScore persists the score", () => {
    const score = buildScore({ story_id: "story-a", provisional_score: 77 });
    discoveryRepository.saveDiscoveryScore(score);
    const stored = internals().scores.get("story-a");
    expect(stored).toEqual(score);
  });

  it("getDiscoveryRun retrieves a stored run", () => {
    const run = buildRun({ run_id: "run-a" });
    discoveryRepository.createDiscoveryRun(run);
    expect(discoveryRepository.getDiscoveryRun("run-a")).toEqual(run);
    expect(discoveryRepository.getDiscoveryRun("does-not-exist")).toBeUndefined();
  });

  it("listRecentDiscoveredStories returns stories sorted by created_at, most recent first", () => {
    jest.useFakeTimers();
    try {
      jest.setSystemTime(new Date("2026-01-01T00:00:00.000Z"));
      discoveryRepository.insertDiscoveredStory(buildStoryInput({ story_id: "oldest" }));
      jest.setSystemTime(new Date("2026-01-02T00:00:00.000Z"));
      discoveryRepository.insertDiscoveredStory(buildStoryInput({ story_id: "middle" }));
      jest.setSystemTime(new Date("2026-01-03T00:00:00.000Z"));
      discoveryRepository.insertDiscoveredStory(buildStoryInput({ story_id: "newest" }));
    } finally {
      jest.useRealTimers();
    }
    const recent = discoveryRepository.listRecentDiscoveredStories(10);
    const ids = recent.map((s) => s.story_id);
    expect(ids.indexOf("newest")).toBeLessThan(ids.indexOf("middle"));
    expect(ids.indexOf("middle")).toBeLessThan(ids.indexOf("oldest"));
  });

  it("listRecentDiscoveredStories respects the limit parameter", () => {
    discoveryRepository.insertDiscoveredStory(buildStoryInput({ story_id: "s1" }));
    discoveryRepository.insertDiscoveredStory(buildStoryInput({ story_id: "s2" }));
    discoveryRepository.insertDiscoveredStory(buildStoryInput({ story_id: "s3" }));
    const limited = discoveryRepository.listRecentDiscoveredStories(2);
    expect(limited).toHaveLength(2);
  });
});
