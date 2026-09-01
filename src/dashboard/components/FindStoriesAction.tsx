"use client";

import { useState } from "react";

/**
 * FIND TODAY'S STORIES — the desk's primary action.
 *
 * This button is Module 01's job only as a trigger surface — the actual
 * discovery run (RSS/news API pull) is Module 02's job (TECH SPEC
 * Section 10). Per Section 5 (API CONTRACTS), the real implementation
 * should POST /api/discovery/run and let the Dashboard reflect the
 * resulting pipeline state — it must NOT call any scraping or ranking
 * logic directly from here.
 *
 * Flat, rectangular, no shadow/animation — a control panel switch, not a
 * marketing CTA. State change is communicated with text and a static
 * border treatment only.
 */
export default function FindStoriesAction() {
  const [status, setStatus] = useState<"idle" | "pending">("idle");

  function handleClick() {
    setStatus("pending");
    // PLACEHOLDER: real implementation calls POST /api/discovery/run
    // (owned by Module 02) and lets the Dashboard re-render from the DB.
    window.setTimeout(() => setStatus("idle"), 1200);
  }

  return (
    <button
      onClick={handleClick}
      disabled={status === "pending"}
      className={`w-full border px-5 py-3 text-xs font-bold uppercase tracking-widest transition-colors disabled:opacity-60 sm:w-auto sm:text-sm ${
        status === "pending"
          ? "border-neutral-700 bg-transparent text-neutral-500"
          : "border-trendulon-orange bg-trendulon-orange text-trendulon-black hover:bg-transparent hover:text-trendulon-orange"
      }`}
    >
      {status === "pending" ? "Searching Feeds…" : "Find Today's Stories"}
    </button>
  );
}
