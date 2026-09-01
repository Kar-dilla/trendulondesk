/**
 * Shared types — /src/lib
 *
 * These mirror the `stories` table shape described in TRENDULON_TECH_SPEC.md
 * Section 4 (DATABASE STRUCTURE). Module 01 only READS this shape; it does not
 * own or write to the `stories` table (that's Module 02+ per Section 7).
 *
 * This file intentionally only models what the Dashboard needs to render.
 * Downstream modules (03, 04, 06, 08, 09, 10, 11, 12) will extend/own the
 * fuller row shapes for their own tables (story_evidence, angles, scripts,
 * critic_reviews, fact_checks, platform_variants, production_briefs, posts,
 * performance_entries) — not duplicated here to avoid Module 01 pretending to
 * know about data it doesn't own.
 */

// Matches Section 3 naming convention: lowercase snake_case status strings.
export type StoryStatus =
  | "discovered" // Module 02 output, not yet ranked
  | "ranked" // Module 03 has scored it
  | "in_research" // Module 04 Story Room active
  | "researched" // Module 04 complete, evidence structured
  | "angle_selected" // Module 05 complete
  | "scripting" // Module 06 in progress
  | "pending_review" // awaiting a human gate (Module 07/08)
  | "needs_revision" // sent back for another pass
  | "approved" // cleared fact-check, ready for Module 09
  | "in_production" // Module 09/10 building variants + shot list
  | "scheduled" // production brief done, awaiting you to film/post
  | "published"; // Module 11 has a logged post

export type Priority = "low" | "medium" | "high" | "urgent";

export interface StoryCardData {
  story_id: string;
  headline: string;
  location: string; // e.g. "Nigeria", "Global", "West Africa"
  category: string; // e.g. "Politics", "Economy", "Conflict"
  fit_score: number; // 0-100, Core Section 5 Fit Score
  priority: Priority;
  status: StoryStatus;
  current_module: number; // 1-12, which module currently owns this story
  updated_at: string; // ISO timestamp
  platform?: string; // populated once it reaches Module 09/10/11 for platform-specific cards
  // Short editorial explanation of the fit score. This is a DISPLAY field
  // only — not a new DB column. It maps 1:1 to Module 03's documented
  // output shape (`{story_id, fit_score, reasons[], recommended_priority}`,
  // TECH SPEC Section 10) and the Dashboard is expected to render the
  // reasons array Module 03 already produces, not invent its own schema.
  fit_reasons?: string[];
}
