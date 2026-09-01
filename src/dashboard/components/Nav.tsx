"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

// Nav structure requested for Module 01. Every route below except "/"
// (Dashboard) is a placeholder shell owned by a future module — see the
// per-route page.tsx files.
const NAV_ITEMS = [
  { label: "Dashboard", short: "Desk", href: "/" },
  { label: "Discover", short: "Discover", href: "/discover" },
  { label: "Stories", short: "Stories", href: "/stories" },
  { label: "Production", short: "Prod", href: "/production" },
  { label: "Content Factory", short: "Factory", href: "/content-factory" },
  { label: "Schedule", short: "Sched", href: "/schedule" },
  { label: "Analytics", short: "Data", href: "/analytics" },
];

/**
 * Masthead + navigation.
 *
 * Redesign note: this replaces the earlier translucent/blurred SaaS-style
 * header and pill-shaped mobile chips with a flat masthead (solid black,
 * single hairline rule) and a fixed bottom tab bar on mobile — closer to
 * a broadcast control surface than a web app toolbar. No icons: labels
 * only, kept short on small screens.
 */
export default function Nav() {
  const pathname = usePathname();

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-neutral-800 bg-trendulon-black">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link href="/" className="flex items-center gap-2.5">
            <Image
              src="/brand/trendulon-logo.png"
              alt="Trendulon"
              width={28}
              height={28}
              priority
            />
            <span className="font-sans leading-none">
              <span className="block text-base font-bold tracking-tight text-trendulon-fog">
                TRENDUL<span className="text-trendulon-orange">ON</span>
              </span>
              <span className="block text-[9px] uppercase tracking-[0.2em] text-neutral-600">
                Desk
              </span>
            </span>
          </Link>

          {/* Desktop nav — text links, hairline active indicator */}
          <nav className="hidden gap-5 md:flex">
            {NAV_ITEMS.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`border-b-2 pb-1 text-xs font-semibold uppercase tracking-widest transition-colors ${
                    active
                      ? "border-trendulon-orange text-trendulon-orange"
                      : "border-transparent text-neutral-400 hover:text-trendulon-fog"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      {/* Mobile nav — fixed bottom bar, text-only, thin active indicator */}
      <nav className="fixed inset-x-0 bottom-0 z-40 flex border-t border-neutral-800 bg-trendulon-black md:hidden">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex-1 border-t-2 py-2 text-center text-[10px] font-semibold uppercase tracking-wide transition-colors ${
                active
                  ? "border-trendulon-orange text-trendulon-orange"
                  : "border-transparent text-neutral-500"
              }`}
            >
              {item.short}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
