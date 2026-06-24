import { Link } from "react-router-dom";
import { Check, Home } from "lucide-react";
import { SiteNav } from "@/public/components/SiteNav";
import { SiteFooter } from "@/public/components/SiteFooter";
import { BadgeInputStep } from "@/public/components/badge/BadgeInputStep";
import { BadgeResultStep } from "@/public/components/badge/BadgeResultStep";
import { useBadgeStudio } from "@/public/hooks/useBadgeStudio";

export function BadgePage() {
  const studio = useBadgeStudio();

  return (
    <div className="kc min-h-screen">
      <SiteNav variant="sub" />

      <main className="kc-paper-dots">
        <div className="mx-auto max-w-2xl px-5 py-12 lg:py-16">
          {/* Pages are independent — offer a clear way home, in the page itself. */}
          <Link
            to="/"
            className="mb-8 inline-flex items-center gap-1.5 rounded-xl border-2 border-ink/15 bg-white px-3 py-2 text-sm font-semibold text-ink/70 transition-colors hover:border-ink/30 hover:text-ink"
          >
            <Home size={16} /> Home
          </Link>
          {studio.step === "input" ? <BadgeInputStep studio={studio} /> : <BadgeResultStep studio={studio} />}
        </div>
      </main>

      <SiteFooter />

      {studio.toast && (
        <div
          role="status"
          className="fixed inset-x-0 bottom-6 z-[60] mx-auto flex w-fit max-w-[calc(100vw-2rem)] items-center gap-2 rounded-full border-2 border-ink bg-ink px-5 py-3 text-sm font-semibold text-white shadow-badge"
        >
          <Check size={16} className="text-pop-mint" /> {studio.toast}
        </div>
      )}
    </div>
  );
}
