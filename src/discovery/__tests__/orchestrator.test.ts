import { runDiscovery } from "../orchestrator";
import type {
  SearchProvider,
  RawSearchResult,
  SearchQueryOptions,
} from "../providers/search-provider";

function buildRawResult(overrides: Partial<RawSearchResult> = {}): RawSearchResult {
  return {
    headline: "Default headline",
    source_url: "https://example.com/default",
    source_name: "Wire Service",
    raw_snippet: "Default summary text",
    published_at: "2026-08-01T00:00:00.000Z",
    ...overrides,
  };
}

function buildProvider(
  resultsOrThrower: RawSearchResult[] | (() => RawSearchResult[]),
  providerName = "test-provider"
): SearchProvider {
  const resolve = async (): Promise<RawSearchResult[]> =>
    typeof resultsOrThrower === "function" ? resultsOrThrower() : resultsOrThrower;

  return {
    providerName,
    searchStories: (_query: string, _opts: SearchQueryOptions) => resolve(),
    searchByCategory: (_category: string, _opts: SearchQueryOptions) => resolve(),
    searchByRegion: (_region: string, _opts: SearchQueryOptions) => resolve(),
    searchRecent: (_opts: SearchQueryOptions) => resolve(),
  };
}

describe("runDiscovery", () => {
  it("returns a complete run with persisted candidates on provider success", async () => {
    const provider = buildProvider([
      buildRawResult({ source_url: "https://a.com/1", headline: "Story One" }),
      buildRawResult({ source_url: "https://b.com/2", headline: "Story Two" }),
    ]);
    const run = await runDiscovery({ provider });
    expect(run.status).toBe("complete");
    expect(run.candidates_found).toBe(2);
    expect(run.candidates_after_dedup).toBe(2);
    expect(run.sources_successful).toBe(1);
    expect(run.errors).toHaveLength(0);
    expect(run.completed_at).not.toBeNull();
  });

  it("returns a failed run when the provider throws", async () => {
    const provider = buildProvider(() => {
      throw new Error("upstream unavailable");
    });
    const run = await runDiscovery({ provider });
    expect(run.status).toBe("failed");
    expect(run.sources_successful).toBe(0);
    expect(run.candidates_found).toBe(0);
    expect(run.errors.length).toBeGreaterThanOrEqual(1);
    expect(run.errors[0].message).toContain("upstream unavailable");
  });

  it("returns partial_failure when some candidates are valid and some are not", async () => {
    const provider = buildProvider([
      buildRawResult({ source_url: "https://a.com/1", headline: "Story One" }),
      buildRawResult({ source_url: "https://b.com/2", headline: "Story Two" }),
      buildRawResult({ source_url: "not-a-valid-url", headline: "Story Three" }),
    ]);
    const run = await runDiscovery({ provider });
    expect(run.status).toBe("partial_failure");
    expect(run.candidates_found).toBe(3);
    expect(run.candidates_after_dedup).toBe(3);
    expect(run.errors.length).toBeGreaterThanOrEqual(1);
    expect(
      run.errors.some((e) => e.message.includes("url must be a valid URL"))
    ).toBe(true);
  });

  it("returns a failed run when the provider yields zero candidates", async () => {
    const provider = buildProvider([]);
    const run = await runDiscovery({ provider });
    expect(run.status).toBe("failed");
    expect(run.candidates_found).toBe(0);
    expect(run.candidates_after_dedup).toBe(0);
    expect(run.sources_successful).toBe(1);
    expect(run.errors).toHaveLength(0);
  });
});
