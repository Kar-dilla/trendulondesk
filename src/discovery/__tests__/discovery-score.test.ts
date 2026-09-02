import { calculateDiscoveryScore } from "../discovery-score";
import type { StoryDiscoveryInput } from "../types/story";
import type { StorySource } from "../types/story-source";

const OLD_DATE = "2000-01-01T00:00:00.000Z";

function buildSource(overrides: Partial<StorySource> = {}): StorySource {
  return {
    source_id: "src-1",
    story_id: "story-1",
    source_name: "Reuters",
    article_title: "Conflict erupts amid crisis",
    url: "https://example.com/a",
    published_at: null,
    retrieved_at: new Date().toISOString(),
    author: null,
    source_type: "news_api",
    credibility_classification: "unverified",
    credibility_score: null,
    ...overrides,
  };
}

function buildStory(overrides: Partial<StoryDiscoveryInput> = {}): StoryDiscoveryInput {
  return {
    story_id: "story-1",
    headline: "Conflict erupts amid crisis",
    summary: "A humanitarian disaster following war and coup reports.",
    category: "Conflict",
    location: "Nigeria",
    countries: ["NG"],
    event_time: null,
    latest_update: new Date().toISOString(),
    status: "discovered",
    source_count: 1,
    sources: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides,
  };
}

describe("calculateDiscoveryScore", () => {
  it("is deterministic for identical input", () => {
    const story = buildStory({ latest_update: OLD_DATE });
    const sources = [buildSource()];

    const a = calculateDiscoveryScore(story, sources, 0.4);
    const b = calculateDiscoveryScore(story, sources, 0.4);

    expect(a.provisional_score).toBe(b.provisional_score);
    expect(a.breakdown).toEqual(b.breakdown);
  });

  it("always returns a provisional_score between 0 and 100", () => {
    const highSignalStory = buildStory({
      latest_update: new Date().toISOString(),
      headline: "war conflict crisis flood earthquake humanitarian geopolitics",
      summary: "protest election coup",
      location: "Nigeria",
    });
    const manySources = ["A", "B", "C", "D", "E", "F"].map((name) =>
      buildSource({ source_name: name })
    );
    const high = calculateDiscoveryScore(highSignalStory, manySources, 0);
    expect(high.provisional_score).toBeGreaterThanOrEqual(0);
    expect(high.provisional_score).toBeLessThanOrEqual(100);

    const lowSignalStory = buildStory({
      latest_update: OLD_DATE,
      headline: "quiet local bake sale",
      summary: "nothing notable happened",
      location: "Antarctica",
    });
    const low = calculateDiscoveryScore(lowSignalStory, [], 1);
    expect(low.provisional_score).toBeGreaterThanOrEqual(0);
    expect(low.provisional_score).toBeLessThanOrEqual(100);
  });

  it("reduces the score as the duplicate penalty increases", () => {
    const story = buildStory({ latest_update: OLD_DATE });
    const sources = [buildSource()];

    const noPenalty = calculateDiscoveryScore(story, sources, 0);
    const fullPenalty = calculateDiscoveryScore(story, sources, 1);

    expect(fullPenalty.provisional_score).toBeLessThan(noPenalty.provisional_score);
  });

  it("decays the recency component as the story ages", () => {
    const fresh = calculateDiscoveryScore(
      buildStory({ latest_update: new Date().toISOString() }),
      [],
      0
    );
    const oneDayOld = calculateDiscoveryScore(
      buildStory({
        latest_update: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      }),
      [],
      0
    );
    const beyondWindow = calculateDiscoveryScore(
      buildStory({ latest_update: OLD_DATE }),
      [],
      0
    );

    expect(fresh.breakdown.recency).toBeGreaterThan(oneDayOld.breakdown.recency);
    expect(oneDayOld.breakdown.recency).toBeGreaterThan(beyondWindow.breakdown.recency);
    expect(beyondWindow.breakdown.recency).toBe(0);
  });

  it.each(["Nigeria", "Lagos, Africa", "Sudan"])(
    'gives regional_relevance of 1.0 for location "%s"',
    (location) => {
      const result = calculateDiscoveryScore(buildStory({ location }), [], 0);
      expect(result.breakdown.regional_relevance).toBe(1.0);
    }
  );

  it("gives regional_relevance of 0.7 for mid-relevance locations", () => {
    const result = calculateDiscoveryScore(
      buildStory({ location: "Gaza" }),
      [],
      0
    );
    expect(result.breakdown.regional_relevance).toBe(0.7);
  });

  it("gives regional_relevance of 0.3 for locations matching neither list", () => {
    const result = calculateDiscoveryScore(
      buildStory({ location: "Antarctica" }),
      [],
      0
    );
    expect(result.breakdown.regional_relevance).toBe(0.3);
  });
});
