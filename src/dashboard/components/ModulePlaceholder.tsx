/**
 * Shared "not yet built" view for routes owned by modules that don't exist
 * in this build. Styled as an off-air desk terminal rather than a rounded
 * SaaS "coming soon" badge — a blank editorial terminal screen, honest
 * about being empty, still in keeping with a control-room aesthetic.
 */
export default function ModulePlaceholder({
  title,
  moduleLabel,
  description,
}: {
  title: string;
  moduleLabel: string;
  description: string;
}) {
  return (
    <div className="border-t border-neutral-700 pt-6">
      <div className="border border-neutral-800 px-4 py-10 text-center sm:px-8 sm:py-16">
        <p className="text-2xs font-semibold uppercase tracking-[0.25em] text-neutral-600">
          Bureau Not Yet Online
        </p>
        <h1 className="mt-3 text-xl font-bold uppercase tracking-wide text-trendulon-fog sm:text-2xl">
          {title}
        </h1>
        <p className="mx-auto mt-3 max-w-md text-xs leading-relaxed text-neutral-500 sm:text-sm">
          {description}
        </p>
        <p className="mt-6 border-t border-neutral-800 pt-4 text-[10px] uppercase tracking-wide text-neutral-700">
          Owned by {moduleLabel}
        </p>
      </div>
    </div>
  );
}
