import { StoryCardData } from "@/src/lib/types";
import StoryCard from "./StoryCard";

/**
 * Editorial section — a labeled block of stories rendered as a vertical
 * list (wire feed), not a card grid. `tone` sets the accent used on the
 * section rule so HIGH PRIORITY reads as the section that matters most.
 */
export default function StorySection({
  title,
  subtitle,
  stories,
  emptyLabel,
  tone = "default",
  numbered = false,
  showFitReasons = false,
}: {
  title: string;
  subtitle?: string;
  stories: StoryCardData[];
  emptyLabel: string;
  tone?: "default" | "priority";
  numbered?: boolean;
  showFitReasons?: boolean;
}) {
  return (
    <section className="mb-10">
      <div
        className={`mb-1 flex items-baseline justify-between border-t pt-2 ${
          tone === "priority" ? "border-trendulon-orange" : "border-neutral-700"
        }`}
      >
        <h2
          className={`text-xs font-bold uppercase tracking-widest sm:text-sm ${
            tone === "priority" ? "text-trendulon-orange" : "text-trendulon-fog"
          }`}
        >
          {title}
        </h2>
        <span className="tnum text-xs text-neutral-600">
          {String(stories.length).padStart(2, "0")}
        </span>
      </div>
      {subtitle && <p className="mb-3 text-2xs text-neutral-600">{subtitle}</p>}

      {stories.length === 0 ? (
        <div className="border border-dashed border-neutral-800 px-4 py-6 text-center text-xs text-neutral-600">
          {emptyLabel}
        </div>
      ) : (
        <div>
          {stories.map((story, i) => (
            <StoryCard
              key={story.story_id}
              story={story}
              rank={numbered ? i + 1 : undefined}
              showFitReasons={showFitReasons}
            />
          ))}
        </div>
      )}
    </section>
  );
}
