/**
 * Provider abstraction for future external search/news services (NewsAPI,
 * GDELT, RSS aggregation — see TECH SPEC Section 2). No real provider is
 * implemented in this batch; this defines the shape multiple providers
 * will conform to later, so Module 02's orchestration code never depends
 * on a specific vendor.
 *
 * Per TECH SPEC Section 0 / Module 02's honest flag: this is plumbing,
 * not live web_search per candidate. Providers return raw candidate rows;
 * de-duplication, scoring, and Story construction happen downstream of
 * the provider call, not inside it.
 */

export interface SearchQueryOptions {
  since?: string; // ISO timestamp — only results newer than this
  limit?: number;
}

export interface RawSearchResult {
  headline: string;
  source_url: string;
  source_name: string;
  published_at: string | null;
  raw_snippet: string;
}

export interface SearchProvider {
  readonly providerName: string;

  searchStories(
    query: string,
    options?: SearchQueryOptions
  ): Promise<RawSearchResult[]>;

  searchByCategory(
    category: string,
    options?: SearchQueryOptions
  ): Promise<RawSearchResult[]>;

  searchByRegion(
    region: string,
    options?: SearchQueryOptions
  ): Promise<RawSearchResult[]>;

  searchRecent(options?: SearchQueryOptions): Promise<RawSearchResult[]>;
}
