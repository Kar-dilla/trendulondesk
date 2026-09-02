import { deduplicateResults } from "../dedup";
import type { RawSearchResult } from "../providers/search-provider";

function buildResult(overrides: Partial<RawSearchResult> = {}): RawSearchResult {
  return {
    headline: "Default headline",
    source_url: "https://example.com/default",
    source_name: "Wire Service",
    raw_snippet: "Default snippet text",
    published_at: "2026-08-01T00:00:00.000Z",
    ...overrides,
  };
}

describe("deduplicateResults", () => {
  it("collapses results that share a normalized URL", () => {
    const results = [
      buildResult({ source_url: "https://example.com/story", headline: "A" }),
      buildResult({ source_url: "https://www.example.com/story/", headline: "B" }),
    ];

    const result = deduplicateResults(results);

    expect(result.uniqueResults).toHaveLength(1);
    expect(result.candidatesAfterDedup).toBe(1);
    expect(result.uniqueResults[0].headline).toBe("A");
  });

  it("collapses results with normalized-duplicate headlines even on different URLs", () => {
    const results = [
      buildResult({ source_url: "https://a.com/1", headline: "Big Story Breaks!" }),
      buildResult({ source_url: "https://b.com/2", headline: "big story breaks" }),
    ];

    const result = deduplicateResults(results);

    expect(result.uniqueResults).toHaveLength(1);
    expect(result.candidatesAfterDedup).toBe(1);
  });

  it("keeps unrelated stories separate", () => {
    const results = [
      buildResult({ source_url: "https://a.com/1", headline: "Story One" }),
      buildResult({ source_url: "https://b.com/2", headline: "Story Two" }),
      buildResult({ source_url: "https://c.com/3", headline: "Story Three" }),
    ];

    const result = deduplicateResults(results);

    expect(result.uniqueResults).toHaveLength(3);
    expect(result.candidatesAfterDedup).toBe(3);
  });

  it("reports correct candidatesFound / candidatesAfterDedup / duplicatesRemoved", () => {
    const results = [
      buildResult({ source_url: "https://a.com/1", headline: "Story One" }),
      buildResult({ source_url: "https://a.com/1/", headline: "Story One Duplicate" }),
      buildResult({ source_url: "https://b.com/2", headline: "story one" }),
      buildResult({ source_url: "https://c.com/3", headline: "Story Three" }),
    ];

    const result = deduplicateResults(results);

    expect(result.candidatesFound).toBe(4);
    expect(result.candidatesAfterDedup).toBe(2);
    expect(result.duplicatesRemoved).toBe(2);
  });

  it("treats an unparseable source_url as having no URL to match on, falling back to headline matching", () => {
    const results = [
      buildResult({ source_url: "not-a-valid-url", headline: "Story One" }),
      buildResult({ source_url: "also-not-valid", headline: "story one" }),
      buildResult({ source_url: "still-not-valid", headline: "Story Two" }),
    ];

    const result = deduplicateResults(results);

    expect(result.candidatesFound).toBe(3);
    expect(result.candidatesAfterDedup).toBe(2);
    expect(result.duplicatesRemoved).toBe(1);
  });
});
