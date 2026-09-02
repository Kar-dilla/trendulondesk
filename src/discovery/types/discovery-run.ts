/**
 * DiscoveryRun — records one execution of Module 02's discovery process,
 * so the Dashboard (Module 01) can tell an editor whether a run was
 * complete or partially failed. Owned and written entirely by Module 02.
 */

export type DiscoveryRunStatus =
  | "running"
  | "complete"
  | "partial_failure"
  | "failed";

export interface DiscoveryRunError {
  source_name: string;
  message: string;
  occurred_at: string; // ISO timestamp
}

export interface DiscoveryRun {
  run_id: string;
  started_at: string; // ISO timestamp
  completed_at: string | null; // ISO timestamp, null while running
  status: DiscoveryRunStatus;
  sources_attempted: number;
  sources_successful: number;
  candidates_found: number;
  candidates_after_dedup: number;
  errors: DiscoveryRunError[];
  warnings: string[];
}
