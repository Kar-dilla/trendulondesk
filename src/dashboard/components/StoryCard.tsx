import { StoryCardData } from "@/src/lib/types";
import {
  STATUS_LABEL,
  STATUS_STYLE,
  PRIORITY_LABEL,
  PRIORITY_MARKER,
  PRIORITY_TEXT,
  isPendingReview,
} from "@/src/lib/status";

/**
 * Story row — the reusable editorial unit every section is built from.
 * Redesigned as a wire-style row (border-bottom divider, no card shadow,
 * no heavy rounding) rather than a boxed dashboard card, so a screen of
 * stories reads like a priority list, not a grid of tiles.
 *
 * `pending_review` rows get a solid orange left edge, per TECH SPEC
 * Section 6: "must be visually distinct — this is the human gate, it
 * should be impossible to miss." Priority otherwise sets a fainter
 * left-edge marker.
 *
 * `rank` is optional — when set (High Priority section) it renders a
 * fixed-width ordinal, like the front page of a wire desk.
 */
export default function StoryCard({
  story,
  rank,
  showFitReasons = false,
}: {
  story: StoryCardData;
  rank?: number;
  showFitReasons?: boolean;
}) {
  const pending = isPendingReview(story.status);
  const edgeClass = pending
    ? "border-l-trendulon-orange"
    : PRIORITY_MARKER[story.priority];

  return (
    <article
      className={`flex gap-3 border-b border-l-2 border-neutral-800 py-4 pl-3 pr-1 sm:gap-4 sm:pl-4 ${edgeClass}`}
    >
      {rank !== undefined && (
        <div className="w-6 shrink-0 pt-0.5 text-right font-mono text-xs text-neutral-600 sm:w-7 sm:text-sm">
          {String(rank).padStart(2, "0")}
        </div>
      )}

      {/* Fit score block — the number the whole row is organized around */}
      <div className="flex w-14 shrink-0 flex-col items-center justify-start pt-0.5 sm:w-16">
        <span className="tnum text-2xl font-bold leading-none text-trendulon-orange sm:text-3xl">
          {story.fit_score}
        </span>
        <span className="mt-1 text-[9px] font-semibold uppercase tracking-wider text-neutral-600">
          Fit
        </span>
      </div>

      {/* Body */}
      <div className="min-w-0 flex-1">
        <h3 className="text-sm font-semibold leading-snug text-trendulon-fog sm:text-base">
          {story.headline}
        </h3>

        <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-2xs text-neutral-500 sm:text-xs">
          <span className="uppercase tracking-wide">{story.category}</span>
          <span aria-hidden className="text-neutral-700">
            /
          </span>
          <span>{story.location}</span>
          {story.platform && (
            <>
              <span aria-hidden className="text-neutral-700">
                /
              </span>
              <span>{story.platform}</span>
            </>
          )}
          <span
            className={`ml-1 font-semibold uppercase tracking-wide ${PRIORITY_TEXT[story.priority]}`}
          >
            {PRIORITY_LABEL[story.priority]}
          </span>
        </div>

        {showFitReasons && story.fit_reasons && story.fit_reasons.length > 0 && (
          <ul className="mt-2 space-y-0.5 border-l border-neutral-800 pl-2">
            {story.fit_reasons.map((reason, i) => (
              <li key={i} className="text-2xs italic leading-snug text-neutral-500 sm:text-xs">
                {reason}
              </li>
            ))}
          </ul>
        )}

        <div className="mt-2 flex items-center gap-2">
          <span
            className={`border px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${STATUS_STYLE[story.status]}`}
          >
            {STATUS_LABEL[story.status]}
          </span>
          <span className="text-[10px] text-neutral-700">
            MOD.{String(story.current_module).padStart(2, "0")}
          </span>
        </div>
      </div>
    </article>
  );
}
