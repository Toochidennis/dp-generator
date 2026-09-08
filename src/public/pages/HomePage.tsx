import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ArrowUpRight, CalendarRange, GraduationCap, Instagram, MapPin, Menu, Phone, X } from "lucide-react";
import type { Program } from "@/shared/types/domain";
import { programService } from "@/shared/services/programService";
import { useAsyncData } from "@/shared/hooks/useAsyncData";
import { formatDateRange } from "@/shared/utils/format";
import { EVENT_BASE_PATH } from "@/public/data/event";
import { Seo } from "@/shared/components/Seo";
import { EmptyState, ErrorState, LoadingState } from "@/shared/components/ui/states";

// Digital Dreams × LinkSkool portal. Visual tokens (brand color, type scale,
// card/button treatment, section rhythm) are lifted from linkskool.net so
// this reads as part of the same family rather than a one-off design.
const BRAND = "#1b3a9e";
const BRAND_LIGHT = "#4f76d8";
const BTN_GLOW = "shadow-[0_10px_30px_-12px_rgba(27,58,158,0.85)]";
const CARD = "rounded-[14px] border border-slate-200/80 bg-white shadow-[0_2px_4px_rgba(15,23,42,0.04)]";
const EYEBROW = "text-[11px] font-semibold uppercase tracking-[0.18em] text-[#1b3a9e]";
const CONTAINER = "mx-auto max-w-7xl px-4 sm:px-6 lg:px-8";

/** Kids Coding Bootcamp already has its own bespoke microsite; route to it
 *  directly instead of the generic /events/:slug page. */
function eventHref(program: Program): string {
  return program.slug === "kids-coding-bootcamp" ? EVENT_BASE_PATH : `/events/${program.slug}`;
}

const HERO_SLIDES = [
  { src: "/images/kids-coding-bootcamp-banner.jpg", alt: "Kids Coding Bootcamp — Digital Dreams' coding program for kids" },
  { src: "/images/event-computer-lab.jpg", alt: "Participants at a Digital Dreams computer lab session" },
  { src: "/images/event-training-session.jpg", alt: "Participants working at laptops during a Digital Dreams session" },
];

function HeroCarousel() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => setIndex((i) => (i + 1) % HERO_SLIDES.length), 4500);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div className="relative mx-auto w-full max-w-md lg:mx-0 lg:max-w-none">
      <div className="relative aspect-[16/9] overflow-hidden rounded-[20px] border border-slate-200/80 bg-white shadow-[0_30px_70px_-30px_rgba(15,23,42,0.35)]">
        {HERO_SLIDES.map((slide, i) => (
          <img
            key={slide.src}
            src={slide.src}
            alt={slide.alt}
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${i === index ? "opacity-100" : "opacity-0"}`}
          />
        ))}
      </div>

      <div className="absolute inset-x-0 bottom-3 flex items-center justify-center gap-1.5">
        {HERO_SLIDES.map((slide, i) => (
          <button
            key={slide.src}
            type="button"
            onClick={() => setIndex(i)}
            aria-label={`Show slide ${i + 1}`}
            className={`h-1.5 rounded-full transition-all ${i === index ? "w-5 bg-white" : "w-1.5 bg-white/60 hover:bg-white/80"}`}
          />
        ))}
      </div>

      <div className="absolute -bottom-5 -left-5 hidden items-center gap-3 rounded-2xl border border-slate-200/80 bg-white px-4 py-3 shadow-[0_18px_40px_-18px_rgba(15,23,42,0.3)] sm:flex">
        <span className="grid size-9 place-items-center rounded-full bg-blue-50 text-[#1b3a9e]">
          <GraduationCap size={18} />
        </span>
        <div>
          <p className="text-sm font-semibold leading-none text-slate-900">17+ years</p>
          <p className="mt-1 text-[11px] font-medium text-slate-500">training developers</p>
        </div>
      </div>
    </div>
  );
}

const NAV_LINKS = [
  { href: "#events", label: "Events" },
  { href: "#about", label: "About" },
  { href: "#contact", label: "Contact" },
];

function PortalNav() {
  const [open, setOpen] = useState(false);
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur-lg">
      <div className={`flex h-16 items-center justify-between gap-4 ${CONTAINER}`}>
        <Link to="/" className="inline-flex items-center gap-2.5" aria-label="Digital Dreams × LinkSkool home">
          {/* digital-dreams-logo.png's wordmark is white — it needs a dark chip behind it, or it reads as invisible on this white bar */}
          <span className="inline-flex items-center rounded-lg bg-[#0e1428] px-2.5 py-1.5">
            <img src="/images/digital-dreams-logo.png" alt="Digital Dreams" className="h-5 w-auto object-contain" />
          </span>
          <span className="text-base font-light text-slate-300" aria-hidden>&times;</span>
          <img src="/images/linkskool-logo.png" alt="LinkSkool" className="h-6 w-6 object-contain" />
          <span className="hidden text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400 sm:inline-block sm:border-l sm:border-slate-200 sm:pl-2.5">
            Events
          </span>
        </Link>

        <nav className="hidden items-center gap-8 lg:flex" aria-label="Sections">
          {NAV_LINKS.map((l) => (
            <a key={l.href} href={l.href} className="text-sm font-medium text-slate-500 transition-colors hover:text-slate-900">
              {l.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <a
            href="#events"
            className={`hidden items-center gap-1.5 rounded-full bg-[#1b3a9e] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#16307f] sm:inline-flex ${BTN_GLOW}`}
          >
            Explore events <ArrowUpRight size={15} />
          </a>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            className="grid size-10 place-items-center rounded-full border border-slate-200 text-slate-600 lg:hidden"
          >
            {open ? <X size={17} /> : <Menu size={17} />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-slate-200 bg-white px-4 pb-4 pt-2 lg:hidden">
          <nav className="grid gap-1" aria-label="Sections">
            {NAV_LINKS.map((l) => (
              <a key={l.href} href={l.href} onClick={() => setOpen(false)} className="rounded-lg px-3 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                {l.label}
              </a>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}

function Hero() {
  return (
    <section className="relative isolate overflow-hidden bg-white pt-16">
      {/* three-layer decoration: soft wash, faint grid, top-right glow — same recipe as linkskool.net's hero */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute inset-0" style={{ backgroundImage: "linear-gradient(#f6f8fe, #fbfcff 42%, #ffffff)" }} />
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(27,58,158,0.055) 1px, transparent 1px), linear-gradient(rgba(27,58,158,0.055) 1px, transparent 1px)",
            backgroundSize: "68px 68px",
            maskImage: "radial-gradient(120% 85% at 50% 0%, black 0%, transparent 72%)",
            WebkitMaskImage: "radial-gradient(120% 85% at 50% 0%, black 0%, transparent 72%)",
          }}
        />
        <div
          className="absolute -right-12 -top-24 size-[480px] rounded-full sm:-right-16 sm:-top-32 sm:size-[768px]"
          style={{ backgroundImage: "radial-gradient(circle, rgba(27,58,158,0.11), transparent 68%)" }}
        />
      </div>

      <div className={`relative grid items-center gap-12 py-16 sm:py-20 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10 lg:py-24 ${CONTAINER}`}>
        <div className="text-center lg:text-left">
          <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#1b3a9e]">
            Digital Dreams &times; LinkSkool
          </span>
          <h1 className="mx-auto mt-6 max-w-xl text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl lg:mx-0 lg:text-6xl">
            Every Digital Dreams event, one home.
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-slate-500 sm:text-lg lg:mx-0">
            Let&apos;s make your dream a reality. Pick a program below to see what it&apos;s about, who it&apos;s for, and how
            to get your attendance card.
          </p>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-3 lg:justify-start">
            <a href="#events" className={`inline-flex items-center gap-2 rounded-full bg-[#1b3a9e] px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-[#16307f] ${BTN_GLOW}`}>
              See all events <ArrowRight size={16} />
            </a>
          </div>
        </div>

        <HeroCarousel />
      </div>
    </section>
  );
}

function EventCard({ program }: { program: Program }) {
  const dateLabel = formatDateRange(program.startDate, program.endDate);
  return (
    <Link
      to={eventHref(program)}
      className={`group flex flex-col overflow-hidden transition hover:-translate-y-1 hover:shadow-[0_18px_40px_-18px_rgba(15,23,42,0.24)] ${CARD}`}
    >
      <div className="relative aspect-[16/9] overflow-hidden" style={{ backgroundImage: `linear-gradient(135deg, ${BRAND}, ${BRAND_LIGHT})` }}>
        {program.bannerUrl ? (
          <img src={program.bannerUrl} alt="" className="h-full w-full object-cover transition duration-300 group-hover:scale-105" />
        ) : (
          <span className="absolute inset-0 grid place-items-center text-3xl font-semibold text-white/90">{program.title.slice(0, 1)}</span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-6">
        {dateLabel && (
          <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-slate-200/80 bg-white px-3 py-1 text-[12px] font-semibold text-slate-600">
            <CalendarRange size={12} className="text-[#1b3a9e]" /> {dateLabel}
          </span>
        )}
        <h3 className="mt-3 text-lg font-semibold tracking-tight text-slate-900">{program.title}</h3>
        <p className="mt-2 line-clamp-3 flex-1 text-sm leading-6 text-slate-500">
          {program.description || "Details for this event are coming soon."}
        </p>
        <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-[#1b3a9e]">
          View event <ArrowRight size={15} className="transition group-hover:translate-x-0.5" />
        </span>
      </div>
    </Link>
  );
}

function EventsSection() {
  const { data, status, error, reload } = useAsyncData((signal) => programService.getPrograms(signal), []);
  const events = useMemo(() => data ?? [], [data]);

  return (
    <section id="events" className={`scroll-mt-16 border-y border-slate-200/70 bg-slate-50/70 py-20 sm:py-24 lg:py-28`}>
      <div className={CONTAINER}>
        <div className="mb-10 text-center">
          <p className={EYEBROW}>Upcoming &amp; running</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">Events</h2>
        </div>

        {status === "loading" ? (
          <LoadingState label="Loading events…" />
        ) : status === "error" ? (
          <ErrorState message={error} onRetry={reload} />
        ) : events.length === 0 ? (
          <EmptyState icon={<CalendarRange size={22} />} title="No events yet" description="Check back soon. We add new programs all the time." />
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {events.map((program) => (
              <EventCard key={program.id} program={program} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function About() {
  const stats = [
    { label: "Years training developers", value: "17+" },
    { label: "Programs run", value: "1+" },
    { label: "Attendance cards issued", value: "1000s" },
    { label: "Focus", value: "Real skills" },
  ];
  return (
    <section id="about" className="bg-white py-20 sm:py-24 lg:py-28">
      <div className={`grid gap-10 lg:grid-cols-[1fr_1fr] ${CONTAINER}`}>
        <div>
          <p className={EYEBROW}>Who&apos;s behind this</p>
          <div className="mt-3 flex items-center gap-3">
            <span className="inline-flex items-center rounded-lg bg-[#0e1428] px-2.5 py-1.5">
              <img src="/images/digital-dreams-logo.png" alt="Digital Dreams" className="h-5 w-auto object-contain" />
            </span>
            <span className="text-base font-light text-slate-300" aria-hidden>&times;</span>
            <img src="/images/linkskool-logo.png" alt="LinkSkool" className="h-7 w-7 object-contain" />
          </div>
          <h2 className="mt-4 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">Digital Dreams &times; LinkSkool</h2>
          <p className="mt-4 max-w-lg text-sm leading-7 text-slate-500">
            Digital Dreams is a top-10 Nigerian ICT firm that&apos;s been training developers since 2007. Together with
            LinkSkool, we&apos;ve gathered every program we run (bootcamps, workshops, community events) under one roof,
            each with its own page and its own downloadable attendance card.
          </p>
        </div>
        <div>
          <div className="overflow-hidden rounded-[20px] border border-slate-200/80 shadow-[0_20px_50px_-24px_rgba(15,23,42,0.3)]">
            <img
              src="/images/event-code-closeup.jpg"
              alt="A laptop screen showing code during a Digital Dreams session"
              className="aspect-[16/10] w-full object-cover"
            />
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-2">
            {stats.map((stat) => (
              <div key={stat.label} className={`p-4 ${CARD}`}>
                <p className="text-xl font-semibold tracking-tight text-[#1b3a9e]">{stat.value}</p>
                <p className="mt-1 text-[11px] font-medium leading-tight text-slate-500">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function PortalFooter() {
  return (
    <footer id="contact" className="bg-slate-950 text-slate-400">
      <div className={`py-16 ${CONTAINER}`}>
        <div className="grid gap-10 md:grid-cols-[1.3fr_1fr_1fr]">
          <div>
            <img src="/images/digital-dreams-logo.png" alt="Digital Dreams" className="h-7 w-auto object-contain" />
            <p className="mt-5 max-w-sm text-sm leading-7 text-slate-400">
              Digital Dreams is a top-10 Nigerian ICT firm that&apos;s been training developers since 2007.
            </p>
            <p className="mt-4 text-xs font-semibold uppercase tracking-[0.14em] text-[#4f76d8]">Let&apos;s make your dream a reality.</p>
          </div>

          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Explore</p>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li><a href="#events" className="font-medium text-slate-300 hover:text-white">Events</a></li>
              <li><a href="#about" className="font-medium text-slate-300 hover:text-white">About</a></li>
            </ul>
          </div>

          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Get in touch</p>
            <ul className="mt-4 space-y-3 text-sm text-slate-300">
              <li>
                <a href="tel:09064660137" className="flex items-center gap-2.5 hover:text-white">
                  <Phone size={15} className="shrink-0 text-[#4f76d8]" /> 09064660137
                </a>
              </li>
              <li className="flex items-start gap-2.5">
                <MapPin size={15} className="mt-0.5 shrink-0 text-[#4f76d8]" />
                <span>No. 1 Nwodo Street, GRA, Enugu</span>
              </li>
              <li>
                <a href="https://instagram.com/DigitalDreamslimited" target="_blank" rel="noreferrer" className="flex items-center gap-2.5 hover:text-white">
                  <Instagram size={15} className="shrink-0 text-[#4f76d8]" /> DigitalDreamslimited
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-white/10 pt-6 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} Digital Dreams. All programs run under one roof.</p>
        </div>
      </div>
    </footer>
  );
}

export function HomePage() {
  return (
    <div className="min-h-screen bg-white font-sans">
      <Seo
        title="Digital Dreams Events"
        description="Every Digital Dreams program in one place. Browse events, see what each one offers, and grab your attendance card."
        path="/"
        siteName="Digital Dreams Events"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "Organization",
          name: "Digital Dreams",
          url: "https://dp.digitaldreamsng.com/",
          logo: "https://dp.digitaldreamsng.com/images/digital-dreams-logo.png",
        }}
      />
      <PortalNav />
      <Hero />
      <EventsSection />
      <About />
      <PortalFooter />
    </div>
  );
}
