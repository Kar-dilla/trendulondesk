import { Priority, StoryStatus } from "./types";

// Display labels + Tailwind classes for each pipeline status.
// Centralized here so every module's rows render status consistently —
// no other module should invent its own status vocabulary (Section 3).
//
// Redesign note: statuses render as flat uppercase tags (text + border),
// not colored pill backgrounds — this is a newsroom desk, not a SaaS
// kanban board. Color is reserved for meaning (orange = needs you).
export const STATUS_LABEL: Record<StoryStatus, string> = {
  discovered: "Discovered",
  ranked: "Ranked",
  in_research: "In Research",
  researched: "Researched",
  angle_selected: "Angle Selected",
  scripting: "Scripting",
  pending_review: "Pending Review",
  needs_revision: "Needs Revision",
  approved: "Approved",
  in_production: "In Production",
  scheduled: "Scheduled",
  published: "Published",
};

export const STATUS_STYLE: Record<StoryStatus, string> = {
  discovered: "border-neutral-700 text-neutral-400",
  ranked: "border-neutral-700 text-neutral-400",
  in_research: "border-neutral-600 text-neutral-300",
  researched: "border-neutral-600 text-neutral-300",
  angle_selected: "border-neutral-600 text-neutral-300",
  scripting: "border-neutral-600 text-neutral-300",
  pending_review: "border-trendulon-orange text-trendulon-orange",
  needs_revision: "border-red-700 text-red-400",
  approved: "border-emerald-700 text-emerald-400",
  in_production: "border-neutral-500 text-trendulon-fog",
  scheduled: "border-neutral-500 text-trendulon-fog",
  published: "border-emerald-700 text-emerald-400",
};

export const PRIORITY_LABEL: Record<Priority, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
  urgent: "Urgent",
};

// Priority reads as a left-edge marker color, not a text badge — see
// StoryRow's border-l treatment.
export const PRIORITY_MARKER: Record<Priority, string> = {
  low: "border-l-neutral-700",
  medium: "border-l-neutral-500",
  high: "border-l-trendulon-orange/70",
  urgent: "border-l-trendulon-orange",
};

export const PRIORITY_TEXT: Record<Priority, string> = {
  low: "text-neutral-500",
  medium: "text-neutral-300",
  high: "text-trendulon-orange",
  urgent: "text-trendulon-orange",
};

// `pending_review` is the human gate the whole system is built around
// (TECH SPEC Section 0.2 / Section 6). It must always be visually distinct.
export function isPendingReview(status: StoryStatus): boolean {
  return status === "pending_review";
}
