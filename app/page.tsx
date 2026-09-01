import FindStoriesAction from "@/src/dashboard/components/FindStoriesAction";
import PipelineSummary from "@/src/dashboard/components/PipelineSummary";
import StorySection from "@/src/dashboard/components/StorySection";
import {
  getTopStories,
  getDevelopingStories,
  getInProductionStories,
  getScheduledContent,
  getRecentlyPublished,
  getPipelineSummary,
} from "@/src/lib/db";

// Server component — reads through the /src/lib/db wrapper only, per
// TECH SPEC Section 7 ("may read any upstream table for context").
export default async function DashboardPage() {
  const [highPriority, developing, inProduction, scheduled, published, summary] =
    await Promise.all([
      getTopStories(),
      getDevelopingStories(),
      getInProductionStories(),
      getScheduledContent(),
      getRecentlyPublished(),
      getPipelineSummary(),
    ]);

  return (
    <div>
      {/* Dateline / desk header — answers "what is this screen" without a
          generic oversized "Dashboard" heading. */}
      <div className="mb-4 flex items-baseline justify-between">
        <p className="text-2xs font-semibold uppercase tracking-[0.2em] text-neutral-600">
          Editorial Desk — Live Pipeline
        </p>
        <p className="text-2xs text-neutral-700">
          Simulated feed — modules 02–12 not yet connected
        </p>
      </div>

      <div className="mb-5">
        <FindStoriesAction />
      </div>

      <PipelineSummary summary={summary} />

      <div className="mt-8">
        <StorySection
          title="High Priority"
          subtitle="Highest fit, needs your editorial decision"
          stories={highPriority}
          emptyLabel="Nothing needs your attention right now."
          tone="priority"
          numbered
          showFitReasons
        />

        <StorySection
          title="Developing"
          subtitle="In research or angle selection"
          stories={developing}
          emptyLabel="Nothing currently in research."
        />

        <StorySection
          title="In Production"
          subtitle="Approved scripts moving through platform adaptation and shot lists"
          stories={inProduction}
          emptyLabel="Nothing in production right now."
        />

        <StorySection
          title="Scheduled"
          subtitle="Production brief complete, waiting on you to film and post"
          stories={scheduled}
          emptyLabel="Nothing scheduled."
        />

        <StorySection
          title="Recently Published"
          subtitle="Logged via Publish Log, Module 11"
          stories={published}
          emptyLabel="Nothing published yet."
        />
      </div>
    </div>
  );
}
