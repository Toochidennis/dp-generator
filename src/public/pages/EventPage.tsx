import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ArrowUpRight, CalendarRange, GraduationCap, Sparkles, Users } from "lucide-react";
import { programService } from "@/shared/services/programService";
import { useAsyncData } from "@/shared/hooks/useAsyncData";
import { formatDateRange } from "@/shared/utils/format";
import { publicProgramUrl } from "@/shared/utils/links";
import { Seo } from "@/shared/components/Seo";
import { LoadingState } from "@/shared/components/ui/states";

const BTN_GLOW = "shadow-[0_10px_30px_-12px_rgba(27,58,158,0.85)]";
const CARD = "rounded-[14px] border border-slate-200/80 bg-white shadow-[0_2px_4px_rgba(15,23,42,0.04)]";

const WHY_JOIN = [
  { icon: Users, text: "Small groups, so you actually get seen and helped, not just talked at." },
  { icon: GraduationCap, text: "Led by Digital Dreams coaches who've been training developers since 2007." },
  { icon: Sparkles, text: "You leave with something to show for it, plus an attendance card to prove you were there." },
];

/**
 * Generic landing page for any event that doesn't have a bespoke microsite
 * yet (compare src/public/pages/LandingPage.tsx, which is Kids Coding
 * Bootcamp's own). Renders whatever the admin has filled in for the program;
 * the surrounding chrome (photos, "why join", trust panel) is deliberately
 * generic so it holds up for any program until it gets real content of its
 * own. Shares the Digital Dreams x LinkSkool token set with HomePage.tsx.
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
          <p className="text-sm font-semibold text-slate-600">{error || "We couldn't find that event."}</p>
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
        description={program.description || `${program.title}, a Digital Dreams event.`}
        path={`/events/${program.slug}`}
        image={program.bannerUrl || "/images/event-training-session.jpg"}
      />

      <header className="border-b border-slate-200/80 bg-white/90 backdrop-blur-lg">
        <div className="mx-auto max-w-4xl px-4 py-4 sm:px-6">
          <Link to="/" className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-900">
            <ArrowLeft size={15} /> All events
          </Link>
        </div>
      </header>

      {/* Hero: the admin's own banner if there is one, otherwise a real photo from
          a Digital Dreams training session rather than a flat color block. */}
      <div className="relative aspect-[16/9] w-full overflow-hidden sm:aspect-[3/1]">
        <img
          src={program.bannerUrl || "/images/event-training-session.jpg"}
          alt=""
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/25 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 mx-auto max-w-4xl px-4 pb-6 sm:px-6 sm:pb-8">
          {dateLabel && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 text-[12px] font-semibold text-slate-700">
              <CalendarRange size={13} className="text-[#1b3a9e]" /> {dateLabel}
            </span>
          )}
          <h1 className="mt-3 text-2xl font-semibold tracking-tight text-white sm:text-4xl">{program.title}</h1>
        </div>
      </div>

      <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:py-14">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr]">
          <div>
            <p className="max-w-2xl text-base leading-7 text-slate-600">
              {program.description ||
                "We're still putting the details together for this one. Check back soon, or reach out and we'll happily fill you in."}
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href={publicProgramUrl(program.slug)}
                className={`inline-flex items-center gap-2 rounded-full bg-[#1b3a9e] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#16307f] ${BTN_GLOW}`}
              >
                Get your attendance card <ArrowUpRight size={16} />
              </a>
            </div>

            <div className="mt-10 space-y-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#1b3a9e]">Why people come back</p>
              <ul className="space-y-3">
                {WHY_JOIN.map(({ icon: Icon, text }) => (
                  <li key={text} className="flex items-start gap-3 text-sm leading-6 text-slate-600">
                    <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-full bg-blue-50 text-[#1b3a9e]">
                      <Icon size={14} />
                    </span>
                    {text}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <aside className={`h-fit overflow-hidden ${CARD}`}>
            <img src="/images/event-computer-lab.jpg" alt="" className="h-40 w-full object-cover" />
            <div className="p-5">
              <p className="text-sm font-semibold text-slate-900">Hosted by Digital Dreams</p>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                A top-10 Nigerian ICT firm that's been training developers since 2007, now doing it together with
                LinkSkool. Every event on this portal is run the same hands-on way.
              </p>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
