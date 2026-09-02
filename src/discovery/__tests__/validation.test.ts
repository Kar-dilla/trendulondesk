import { validateStoryDiscoveryInput } from "../validation/story-validation";
import type { StoryDiscoveryInput } from "../types/story";
import type { StorySource } from "../types/story-source";

function buildValidSource(overrides: Partial<StorySource> = {}): StorySource {
  return {
    source_id: "src-1",
    story_id: "story-1",
    source_name: "Reuters",
    article_title: "Test headline",
    url: "https://example.com/article",
    published_at: "2026-08-01T00:00:00.000Z",
    retrieved_at: "2026-08-01T01:00:00.000Z",
    author: null,
    source_type: "news_api",
    credibility_classification: "unverified",
    credibility_score: null,
    ...overrides,
  };
}

function buildValidInput(overrides: Partial<StoryDiscoveryInput> = {}): StoryDiscoveryInput {
  return {
    story_id: "story-1",
    headline: "Test headline",
    summary: "Test summary",
    category: "Conflict",
    location: "Nigeria",
    countries: ["NG"],
    event_time: "2026-08-01T00:00:00.000Z",
    latest_update: "2026-08-01T02:00:00.000Z",
    status: "discovered",
    source_count: 1,
    sources: [buildValidSource()],
    created_at: "2026-08-01T02:00:00.000Z",
    updated_at: "2026-08-01T02:00:00.000Z",
    ...overrides,
  };
}

describe("validateStoryDiscoveryInput", () => {
  it("passes for a fully valid StoryDiscoveryInput", () => {
    const result = validateStoryDiscoveryInput(buildValidInput());
    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it("fails when a required string field is missing", () => {
    const valid = buildValidInput();
    const { headline, ...rest } = valid;
    const invalid = rest as unknown as StoryDiscoveryInput;
    const result = validateStoryDiscoveryInput(invalid);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain("headline is required");
  });

  it("fails when countries is not an array", () => {
    const invalid = {
      ...buildValidInput(),
      countries: "NG",
    } as unknown as StoryDiscoveryInput;
    const result = validateStoryDiscoveryInput(invalid);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain("countries must be an array");
  });

  it("fails when sources is empty", () => {
    const invalid = buildValidInput({ sources: [], source_count: 0 });
    const result = validateStoryDiscoveryInput(invalid);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain(
      "sources must be a non-empty array — every Story needs provenance"
    );
  });

  it("fails when source_count does not match sources.length", () => {
    const invalid = buildValidInput({ source_count: 5 });
    const result = validateStoryDiscoveryInput(invalid);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain("source_count must match sources.length");
  });

  it.each(["fit", "fit_score", "priority", "evidence_confidence"])(
    'rejects the forbidden key "%s"',
    (key) => {
      const invalid = {
        ...buildValidInput(),
        [key]: 1,
      } as unknown as StoryDiscoveryInput;
      const result = validateStoryDiscoveryInput(invalid);
      expect(result.valid).toBe(false);
      expect(
        result.errors.some((e) => e.includes(`"${key}"`) && e.includes("owned by a downstream module"))
      ).toBe(true);
    }
  );

  it('fails when status is not exactly "discovered"', () => {
    const invalid = {
      ...buildValidInput(),
      status: "published",
    } as unknown as StoryDiscoveryInput;
    const result = validateStoryDiscoveryInput(invalid);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain(
      'status must be "discovered" — Module 02 may not write any other status'
    );
  });
});
