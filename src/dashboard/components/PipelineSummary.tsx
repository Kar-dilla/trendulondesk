type Summary = {
  discovered_today: number;
  awaiting_review: number;
  in_production: number;
  scheduled: number;
  published_this_week: number;
};

const ROWS: { key: keyof Summary; label: string; emphasize?: boolean }[] = [
  { key: "discovered_today", label: "Discovered" },
  { key: "awaiting_review", label: "Awaiting Review", emphasize: true },
  { key: "in_production", label: "In Production" },
  { key: "scheduled", label: "Scheduled" },
  { key: "published_this_week", label: "Published, 7d" },
];

/**
 * Pipeline snapshot — rendered as a single thin ruled strip (like a
 * broadcast lower-third stat bar), not a grid of stat cards. Divider
 * lines carry the structure instead of boxes/shadows.
 */
export default function PipelineSummary({ summary }: { summary: Summary }) {
  return (
    <div className="grid grid-cols-3 divide-x divide-neutral-800 border-y border-neutral-800 sm:grid-cols-5">
      {ROWS.map((row) => (
        <div key={row.key} className="px-2 py-3 text-center sm:px-3">
          <div
            className={`tnum text-lg font-bold leading-none sm:text-xl ${
              row.emphasize ? "text-trendulon-orange" : "text-trendulon-fog"
            }`}
          >
            {summary[row.key]}
          </div>
          <div className="mt-1 text-[10px] uppercase leading-tight tracking-wide text-neutral-600 sm:text-2xs">
            {row.label}
          </div>
        </div>
      ))}
    </div>
  );
}
