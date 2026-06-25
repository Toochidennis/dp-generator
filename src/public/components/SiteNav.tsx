import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { event, footerLinks } from "@/public/data/event";

function Logo() {
  return (
    <Link to="/" className="inline-flex items-center gap-2.5" aria-label={`${event.brand} — home`}>
      <span className="inline-flex items-center rounded-xl border-2 border-ink bg-ink px-2.5 py-1.5">
        <img src="/images/digital-dreams-logo.png" alt="Digital Dreams" className="h-5 w-auto object-contain sm:h-[22px]" />
      </span>
      <span className="hidden font-display text-sm font-bold leading-none text-ink sm:inline">
        Kids Coding
        <br />
        Bootcamp
      </span>
    </Link>
  );
}

/** Sticky top bar, shared across pages: brand + section nav + (mobile) menu.
 *  Sub-pages also get a top-left "Back" affordance; only the landing page shows
 *  the "Generate badge" CTA (you're already there on the badge page). */
export function SiteNav({ variant = "landing" }: { variant?: "landing" | "sub" }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const isSub = variant === "sub";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 transition-colors duration-300 ${
        scrolled ? "border-b-2 border-ink/10 bg-paper/85 backdrop-blur-md" : "border-b-2 border-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3">
        <Logo />

        {/* Center: section nav (desktop) — landing only. On a sub-page these would
            navigate users away from their task, so the header stays focused. */}
        {!isSub && (
          <nav className="hidden items-center gap-7 lg:flex" aria-label="Sections">
            {footerLinks.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="text-sm font-semibold text-ink/70 transition-colors hover:text-ink"
              >
                {l.label}
              </a>
            ))}
          </nav>
        )}

        {/* Right: badge CTA + mobile menu toggle — landing only. */}
        {!isSub && (
          <div className="flex items-center gap-2">
            <Link to="/badge" className="kc-btn bg-brand text-ink text-sm hover:bg-brand-dark">
              Generate badge
              <ArrowUpRight size={17} />
            </Link>
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              className="grid size-11 place-items-center rounded-xl border-2 border-ink bg-white text-ink lg:hidden"
            >
              {open ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        )}
      </div>

      {/* Mobile menu — section nav, landing only. */}
      {!isSub && open && (
        <div className="border-t-2 border-ink/10 bg-paper px-5 pb-5 pt-2 lg:hidden">
          <nav className="grid gap-1" aria-label="Sections">
            {footerLinks.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="rounded-xl px-3 py-2.5 text-base font-semibold text-ink/80 hover:bg-white"
              >
                {l.label}
              </a>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
