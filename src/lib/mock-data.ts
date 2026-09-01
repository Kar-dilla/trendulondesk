import { StoryCardData } from "./types";

/**
 * ⚠️ MOCK DATA — NOT REAL.
 *
 * Module 01 has no database connection of its own (per TECH SPEC Section 10,
 * Module 01's "Output: UI only. No Claude call" — it reads from the DB, it
 * doesn't create data). Modules 02-12 don't exist yet in this build, so
 * there is nothing real to read.
 *
 * This file is a stand-in for the real queries in `./db.ts` until a real
 * Postgres/Supabase connection exists. Grouping matches the editorial
 * hierarchy the Dashboard renders: HIGH PRIORITY / DEVELOPING /
 * IN PRODUCTION / SCHEDULED / RECENTLY PUBLISHED. `fit_reasons` mirrors
 * Module 03's documented `reasons[]` output — not a new field invented
 * here.
 */

export const MOCK_HIGH_PRIORITY: StoryCardData[] = [
  {
    story_id: "mock-001",
    headline: "Central Bank Raises Rates Amid Currency Pressure",
    location: "Nigeria",
    category: "Economy",
    fit_score: 92,
    priority: "urgent",
    status: "pending_review",
    current_module: 8,
    updated_at: "2026-08-31T08:12:00Z",
    fit_reasons: [
      "Direct household financial impact — explains a cost people already feel",
      "Clear before/after numbers make a strong hook",
    ],
  },
  {
    story_id: "mock-002",
    headline: "Regional Bloc Announces Emergency Summit Over Border Dispute",
    location: "West Africa",
    category: "Politics",
    fit_score: 87,
    priority: "high",
    status: "researched",
    current_module: 4,
    updated_at: "2026-08-31T07:40:00Z",
    fit_reasons: [
      "Underreported in Western outlets — Trendulon's stated gap",
      "Multiple credible sources already confirming core facts",
    ],
  },
  {
    story_id: "mock-003",
    headline: "Fuel Subsidy Reform: What Changed and Who Pays",
    location: "Nigeria",
    category: "Economy",
    fit_score: 88,
    priority: "high",
    status: "pending_review",
    current_module: 8,
    updated_at: "2026-08-30T19:05:00Z",
    fit_reasons: [
      "Policy explainer with a concrete winner/loser framing",
      "High search interest over the last 48 hours",
    ],
  },
];

export const MOCK_DEVELOPING: StoryCardData[] = [
  {
    story_id: "mock-004",
    headline: "Flooding Displaces Thousands, Response Effort Under Scrutiny",
    location: "East Africa",
    category: "Disaster",
    fit_score: 81,
    priority: "high",
    status: "in_research",
    current_module: 4,
    updated_at: "2026-08-31T05:20:00Z",
    fit_reasons: ["Human-impact angle with strong visual potential"],
  },
  {
    story_id: "mock-005",
    headline: "Corruption Probe Widens to Include Former Ministers",
    location: "Nigeria",
    category: "Politics",
    fit_score: 79,
    priority: "high",
    status: "angle_selected",
    current_module: 5,
    updated_at: "2026-08-30T22:10:00Z",
    fit_reasons: ["Ongoing accountability story with an active document trail"],
  },
  {
    story_id: "mock-006",
    headline: "Tech Layoffs Ripple Through Regional Startup Hubs",
    location: "Global",
    category: "Tech",
    fit_score: 74,
    priority: "medium",
    status: "ranked",
    current_module: 3,
    updated_at: "2026-08-31T06:55:00Z",
    fit_reasons: ["Cross-border relevance, moderate urgency"],
  },
];

export const MOCK_IN_PRODUCTION: StoryCardData[] = [
  {
    story_id: "mock-007",
    headline: "Explainer: The New Trade Corridor and Who Benefits",
    location: "Global",
    category: "Economy",
    fit_score: 83,
    priority: "medium",
    status: "in_production",
    current_module: 10,
    updated_at: "2026-08-30T14:30:00Z",
  },
];

export const MOCK_SCHEDULED: StoryCardData[] = [
  {
    story_id: "mock-008",
    headline: "Currency Black Market Rate Gap Widens Again",
    location: "Nigeria",
    category: "Economy",
    fit_score: 85,
    priority: "medium",
    status: "scheduled",
    current_module: 10,
    updated_at: "2026-08-30T09:15:00Z",
    platform: "Instagram Reels",
  },
];

export const MOCK_RECENTLY_PUBLISHED: StoryCardData[] = [
  {
    story_id: "mock-009",
    headline: "Election Commission Responds to Ballot Delay Allegations",
    location: "Nigeria",
    category: "Politics",
    fit_score: 90,
    priority: "high",
    status: "published",
    current_module: 12,
    updated_at: "2026-08-29T18:00:00Z",
    platform: "TikTok",
  },
];

export const PIPELINE_SUMMARY = {
  discovered_today: 34,
  awaiting_review: 3,
  in_production: 1,
  scheduled: 1,
  published_this_week: 5,
};
