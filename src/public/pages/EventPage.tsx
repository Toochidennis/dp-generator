import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ArrowUpRight, CalendarRange } from "lucide-react";
import { programService } from "@/shared/services/programService";
import { useAsyncData } from "@/shared/hooks/useAsyncData";
import { formatDateRange } from "@/shared/utils/format";
import { publicProgramUrl } from "@/shared/utils/links";
import { Seo } from "@/shared/components/Seo";
import { LoadingState } from "@/shared/components/ui/states";

const BRAND = "#1b3a9e";
const BRAND_LIGHT = "#4f76d8";
const BTN_GLOW = "shadow-[0_10px_30px_-12px_rgba(27,58,158,0.85)]";

/**
 * Generic landing page for any event that doesn't have a bespoke microsite
 * yet (compare src/public/pages/LandingPage.tsx, which is Kids Coding
 * Bootcamp's own). Renders whatever the admin has filled in for the program;
 * intentionally minimal until real per-event content is supplied. Shares the
 * Digital Dreams x LinkSkool token set with HomePage.tsx.
 */
export function EventPage() {
  const { slug = "" } = useParams();
  const { data: program, status, error } = useAsyncData((signal) => programService.getProgramBySlug(slug, signal), [slug]);

  if (status === "loading") {
    return (
      <div className="grid min-h-screen place-items-center bg-white font-sans">
        <LoadingState label="Loading event…" />
      </div>
    );
  }

  if (status === "error" || !program) {
    return (
      <div className="grid min-h-screen place-items-center bg-white p-6 text-center font-sans">
        <Seo title="Event Not Found | Digital Dreams" description="This event could not be found." path={`/events/${slug}`} robots="noindex, nofollow" />
        <div>
          <p className="text-sm font-semibold text-slate-600">{error || "This event could not be found."}</p>
          <Link
            to="/"
            className={`mt-4 inline-flex items-center gap-1.5 rounded-full bg-[#1b3a9e] px-5 py-2.5 text-xs font-semibold text-white ${BTN_GLOW}`}
          >
            <ArrowLeft size={14} /> Back to all events
          </Link>
        </div>
      </div>
    );
  }

  const dateLabel = formatDateRange(program.startDate, program.endDate);

  return (
    <div className="min-h-screen bg-white font-sans">
      <Seo
        title={`${program.title} | Digital Dreams`}
        description={program.description || `${program.title} — a Digital Dreams event.`}
        path={`/events/${program.slug}`}
        image={program.bannerUrl || "/images/digital-dreams-logo.png"}
      />

      <header className="border-b border-slate-200/80 bg-white/90 backdrop-blur-lg">
        <div className="mx-auto max-w-4xl px-4 py-4 sm:px-6">
          <Link to="/" className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-900">
            <ArrowLeft size={15} /> All events
          </Link>
        </div>
      </header>

      <div className="relative aspect-[21/9] w-full overflow-hidden sm:aspect-[3/1]" style={{ backgroundImage: `linear-gradient(135deg, ${BRAND}, ${BRAND_LIGHT})` }}>
        {program.bannerUrl ? (
          <img src={program.bannerUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          <span className="absolute inset-0 grid place-items-center text-4xl font-semibold text-white/90">{program.title}</span>
        )}
      </div>

      <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:py-14">
        {dateLabel && (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200/80 bg-white px-3 py-1.5 text-[12px] font-semibold text-slate-600">
            <CalendarRange size={13} className="text-[#1b3a9e]" /> {dateLabel}
          </span>
        )}
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">{program.title}</h1>
        <p className="mt-5 max-w-2xl text-base leading-7 text-slate-500">
          {program.description || "More details for this event are on the way — check back soon."}
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <a
            href={publicProgramUrl(program.slug)}
            className={`inline-flex items-center gap-2 rounded-full bg-[#1b3a9e] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#16307f] ${BTN_GLOW}`}
          >
            Get your attendance card <ArrowUpRight size={16} />
          </a>
        </div>
      </main>
    </div>
  );
}
