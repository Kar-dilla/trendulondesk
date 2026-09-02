/**
 * StorySource — preserves provenance for every piece of evidence a Story
 * is built from. Owned and written by Module 02 (a discovery run is what
 * first observes a source). Later modules (04+) attach their own evidence
 * to `story_evidence`, a separate table this file does not model.
 */

export type SourceType =
  | "rss"
  | "news_api"
  | "wire_service"
  | "official_statement"
  | "social_media"
  | "manual_entry";

export type CredibilityClassification =
  | "primary" // official/wire/first-party
  | "established_press"
  | "regional_press"
  | "aggregator"
  | "unverified";

export interface StorySource {
  source_id: string;
  story_id: string; // foreign key back to Story
  source_name: string; // e.g. "Reuters", "Premium Times"
  article_title: string;
  url: string;
  published_at: string | null; // ISO timestamp; null if the source didn't expose one
  retrieved_at: string; // ISO timestamp Module 02 pulled it
  author: string | null;
  source_type: SourceType;
  credibility_classification: CredibilityClassification;
  credibility_score: number | null; // 0-100 if a classifier scored it, else null
}
