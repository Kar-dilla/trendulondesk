// src/discovery/repositories/story-discovery-repository.ts

import type {
  Story,
  StoryDiscoveryInput,
  StorySource,
  DiscoveryRun,
  DiscoveryScore,
} from "../types";

/**
 * Module 02's local persistence layer.
 * 
 * Rules:
 * - In-memory only (acceptable for Batch 2)
 * - Never touches src/lib/db.ts
 * - StoryDiscoveryInput is the ONLY insert shape
 * - Timestamps are set at insert time
 * - All lookups are by string IDs (story_id, run_id, source_id)
 */
export interface StoryDiscoveryRepository {
  insertDiscoveredStory(input: StoryDiscoveryInput): Story;
  insertStorySources(sources: StorySource[]): void;
  createDiscoveryRun(run: DiscoveryRun): void;
  updateDiscoveryRun(run: DiscoveryRun): void;
  saveDiscoveryScore(score: DiscoveryScore): void;
  getDiscoveryRun(run_id: string): DiscoveryRun | undefined;
  listRecentDiscoveredStories(limit: number): Story[];
}

export class InMemoryStoryDiscoveryRepository implements StoryDiscoveryRepository {
  private stories = new Map<string, Story>();
  private sources = new Map<string, StorySource[]>();
  private runs = new Map<string, DiscoveryRun>();
  private scores = new Map<string, DiscoveryScore>();

  insertDiscoveredStory(input: StoryDiscoveryInput): Story {
    const now = new Date().toISOString();
    
    const story: Story = {
      ...input,
      created_at: now,
      updated_at: now,
    };

    this.stories.set(input.story_id, story);
    return story;
  }

  insertStorySources(sources: StorySource[]): void {
    for (const source of sources) {
      const existing = this.sources.get(source.story_id) ?? [];
      existing.push(source);
      this.sources.set(source.story_id, existing);
    }
  }

  createDiscoveryRun(run: DiscoveryRun): void {
    this.runs.set(run.run_id, run);
  }

  updateDiscoveryRun(run: DiscoveryRun): void {
    this.runs.set(run.run_id, run);
  }

  saveDiscoveryScore(score: DiscoveryScore): void {
    this.scores.set(score.story_id, score);
  }

  getDiscoveryRun(run_id: string): DiscoveryRun | undefined {
    return this.runs.get(run_id);
  }

  listRecentDiscoveredStories(limit: number): Story[] {
    return Array.from(this.stories.values())
      .sort((a, b) => b.created_at.localeCompare(a.created_at))
      .slice(0, limit);
  }
}

export const discoveryRepository = new InMemoryStoryDiscoveryRepository();
