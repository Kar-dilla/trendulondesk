/**
 * MockSearchProvider — deterministic stand-in for a real SearchProvider
 * (NewsAPI/GDELT/RSS/etc.) implementation, per TECH SPEC Section 2. No
 * network calls; all 4 interface methods draw from the same static pool
 * of mock candidates so downstream Module 02 orchestration code can be
 * developed and tested against a stable SearchProvider before any real
 * provider exists.
 */

import type {
  SearchProvider,
  SearchQueryOptions,
  RawSearchResult,
} from "./search-provider";

const MOCK_POOL: RawSearchResult[] = [
  {
    headline: "UN Security Council Convenes Emergency Session on Regional Ceasefire",
    source_url: "https://example-newswire.com/un-security-council-ceasefire",
    source_name: "Global Wire Service",
    published_at: "2026-08-28T09:15:00Z",
    raw_snippet:
      "Diplomats gathered for an emergency session after reports of a breach in the negotiated ceasefire along the contested border region.",
  },
  {
    headline: "Central Banks Signal Coordinated Rate Pause Amid Slowing Global Growth",
    source_url: "https://example-financial.com/central-banks-rate-pause",
    source_name: "Financial Ledger",
    published_at: "2026-08-30T14:42:00Z",
    raw_snippet:
      "Policymakers across three major economies hinted at a synchronized pause in rate hikes as manufacturing data softened for a third straight month.",
  },
  {
    headline: "Record Heatwave Strains Power Grids Across Southern Europe",
    source_url: "https://example-climate.com/heatwave-southern-europe-grids",
    source_name: "Climate Desk Daily",
    published_at: "2026-08-25T06:00:00Z",
    raw_snippet:
      "Utility operators in Spain, Italy, and Greece reported rolling brownouts as temperatures crossed 44C for the fifth consecutive day.",
  },
  {
    headline: "Major Chipmaker Unveils Next-Generation AI Accelerator",
    source_url: "https://example-tech.com/chipmaker-ai-accelerator-launch",
    source_name: "Tech Frontier",
    published_at: "2026-09-01T17:30:00Z",
    raw_snippet:
      "The company claims a 2.3x performance-per-watt improvement over its previous flagship, targeting hyperscale data center customers.",
  },
  {
    headline: "Youth-Led Protests Spread to Third City Over Election Delay",
    source_url: "https://example-regional.com/youth-protests-election-delay",
    source_name: "Regional Press Network",
    published_at: "2026-08-31T20:10:00Z",
    raw_snippet:
      "Organizers say demonstrations will continue until election authorities publish a revised timeline, now more than two months overdue.",
  },
];

export class MockSearchProvider implements SearchProvider {
  readonly providerName = "mock-search";

  async searchStories(
    _query: string,
    options?: SearchQueryOptions
  ): Promise<RawSearchResult[]> {
    return this.getMockResults(options);
  }

  async searchByCategory(
    _category: string,
    options?: SearchQueryOptions
  ): Promise<RawSearchResult[]> {
    return this.getMockResults(options);
  }

  async searchByRegion(
    _region: string,
    options?: SearchQueryOptions
  ): Promise<RawSearchResult[]> {
    return this.getMockResults(options);
  }

  async searchRecent(
    options?: SearchQueryOptions
  ): Promise<RawSearchResult[]> {
    return this.getMockResults(options);
  }

  private getMockResults(
    options?: SearchQueryOptions
  ): RawSearchResult[] {
    let results = [...MOCK_POOL];

    if (options?.since) {
      const sinceTime = Date.parse(options.since);
      if (!Number.isNaN(sinceTime)) {
        results = results.filter((r) => {
          if (!r.published_at) return false;
          const publishedTime = Date.parse(r.published_at);
          return !Number.isNaN(publishedTime) && publishedTime > sinceTime;
        });
      }
    }

    if (options?.limit !== undefined) {
      results = results.slice(0, Math.max(0, options.limit));
    }

    return results;
  }
}
