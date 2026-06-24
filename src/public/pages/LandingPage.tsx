import { Link } from "react-router-dom";
import {
  ArrowRight,
  ArrowUpRight,
  Blocks,
  Bot,
  Box,
  Brain,
  Calendar,
  Globe,
  MapPin,
  Palette,
  Phone,
  Plus,
  Smartphone,
  Sparkles,
  Terminal,
  Users,
} from "lucide-react";
import { SiteNav } from "@/public/components/SiteNav";
import { SiteFooter } from "@/public/components/SiteFooter";
import { CodeChip } from "@/public/components/CodeChip";
import { FlipClock } from "@/public/components/FlipClock";
import { useReveal } from "@/public/lib/useReveal";
import { accentBg, accentText, accentTint } from "@/public/lib/accents";
import {
  about,
  codeBlocks,
  event,
  faqs,
  heroStats,
  modules,
  tiers,
  tracks,
} from "@/public/data/event";

// One icon per course in `modules`, in order.
const moduleIcons = [Blocks, Globe, Terminal, Palette, Box, Bot, Smartphone, Brain];

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="kc-eyebrow text-pop-blue">{children}</p>;
}

/* ----------------------------------- Hero ---------------------------------- */
function Hero() {
  return (
    <section className="kc-paper-dots relative overflow-hidden">
      {/* soft brand glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-32 -top-24 h-96 w-96 rounded-full bg-brand/25 blur-3xl"
      />
      <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-5 pb-20 pt-14 lg:grid-cols-[1.05fr_0.95fr] lg:pb-28 lg:pt-20">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border-2 border-ink/10 bg-white px-3.5 py-1.5 text-ink">
            <Sparkles size={15} className="text-brand" />
            <span className="kc-eyebrow text-[0.66rem]">{event.brand} Academy presents</span>
          </span>

          <h1 className="mt-6 font-display text-[2.65rem] font-extrabold leading-[0.98] text-ink sm:text-6xl lg:text-[4.1rem]">
            Kids build their
            <br />
            first <span className="relative whitespace-nowrap text-brand-dark">real
              <svg
                aria-hidden
                viewBox="0 0 200 18"
                preserveAspectRatio="none"
                className="absolute -bottom-1.5 left-0 h-2.5 w-full text-brand"
              >
                <path d="M2 13 C 60 4, 140 4, 198 12" fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
              </svg>
            </span>{" "}
            software.
          </h1>

          <p className="mt-6 max-w-md text-lg leading-relaxed text-ink/70">{event.blurb}</p>

          {/* ticket-stub meta */}
          <dl className="mt-7 flex flex-wrap gap-x-6 gap-y-3 font-code text-sm">
            <div className="flex items-center gap-2">
              <Calendar size={16} className="text-pop-blue" />
              <dt className="sr-only">Dates</dt>
              <dd className="font-semibold text-ink">{event.dateLabel}</dd>
            </div>
            <div className="flex items-center gap-2">
              <MapPin size={16} className="text-pop-coral" />
              <dt className="sr-only">Venue</dt>
              <dd className="font-semibold text-ink">{event.venueAddress}</dd>
            </div>
            <div className="flex items-center gap-2">
              <Users size={16} className="text-pop-mint" />
              <dt className="sr-only">Ages</dt>
              <dd className="font-semibold text-ink">{event.ageLabel}</dd>
            </div>
          </dl>

          <div className="mt-9 flex flex-wrap items-center gap-3">
            <Link to="/badge" className="kc-btn bg-brand text-ink hover:bg-brand-dark">
              Generate your badge <ArrowUpRight size={18} />
            </Link>
            <a href="#learn" className="kc-btn bg-white text-ink hover:bg-paper">
              See what they learn <ArrowRight size={17} />
            </a>
          </div>
          <p className="mt-4 font-code text-xs text-ink/55">
            {event.seatsLabel} · {event.feeLabel} {event.feeNote}
          </p>
        </div>

        {/* Visual: console card + floating code blocks */}
        <div className="relative mx-auto w-full max-w-md lg:mx-0">
          <div className="kc-block rounded-3xl bg-ink p-1.5 shadow-badge">
            <div className="kc-dots rounded-[18px] bg-ink px-5 pb-6 pt-4">
              <div className="flex items-center gap-1.5 pb-4">
                <span className="size-3 rounded-full bg-pop-coral" />
                <span className="size-3 rounded-full bg-brand" />
                <span className="size-3 rounded-full bg-pop-mint" />
                <span className="ml-2 font-code text-xs text-white/45">bootcamp.py</span>
              </div>
              <pre className="font-code text-[0.82rem] leading-7 text-white/90">
                <span className="text-white/40"># enroll</span>
                {"\n"}
                <span className="text-pop-mint">kids</span> = [<span className="text-brand">"you"</span>]
                {"\n"}
                <span className="text-pop-blue">for</span> kid <span className="text-pop-blue">in</span> kids:
                {"\n"}
                {"    "}kid.<span className="text-brand">build</span>()
                {"\n"}
                <span className="kc-caret text-pop-mint">print(</span>
              </pre>
            </div>
          </div>

          {/* floating blocks around the card */}
          <div className="pointer-events-none absolute -left-6 -top-5 hidden sm:block">
            <CodeChip {...codeBlocks[0]} float="" />
          </div>
          <div className="pointer-events-none absolute -right-5 top-16 hidden sm:block">
            <CodeChip {...codeBlocks[1]} float="slow" />
          </div>
          <div className="pointer-events-none absolute -left-8 bottom-10 hidden sm:block">
            <CodeChip {...codeBlocks[2]} float="rev" />
          </div>
          <div className="pointer-events-none absolute -bottom-6 right-2 hidden sm:block">
            <CodeChip {...codeBlocks[3]} float="" />
          </div>
        </div>
      </div>

      {/* countdown */}
      <div className="relative mx-auto max-w-6xl px-5 pb-16 lg:pb-20">
        <div className="flex flex-col items-center text-center">
          <p className="kc-eyebrow text-pop-blue">// bootcamp kicks off in</p>
          <div className="mt-5">
            <FlipClock targetISO={event.startISO} />
          </div>
        </div>
      </div>

      {/* stats strip */}
      <div className="border-y-2 border-ink/10 bg-ink">
        <dl className="mx-auto grid max-w-6xl grid-cols-2 divide-x-2 divide-white/10 sm:grid-cols-4">
          {heroStats.map((s) => (
            <div key={s.label} className="px-5 py-6 text-center">
              <dt className="sr-only">{s.label}</dt>
              <dd className="font-display text-3xl font-extrabold text-brand sm:text-4xl">{s.value}</dd>
              <p className="mt-1 font-code text-[0.68rem] uppercase tracking-wider text-white/55">{s.label}</p>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

/* ---------------------------------- About ---------------------------------- */
function About() {
  return (
    <section id="about" className="mx-auto max-w-6xl scroll-mt-20 px-5 py-20 lg:py-28">
      <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="kc-reveal">
          <SectionLabel>{about.kicker}</SectionLabel>
          <h2 className="mt-3 max-w-md font-display text-4xl font-extrabold leading-tight text-ink sm:text-5xl">
            {about.title}
          </h2>
        </div>
        <div className="kc-reveal space-y-5">
          {about.body.map((p) => (
            <p key={p.slice(0, 16)} className="text-lg leading-relaxed text-ink/75">
              {p}
            </p>
          ))}
        </div>
      </div>

      <div className="mt-12 grid gap-5 sm:grid-cols-3">
        {about.pillars.map((p) => (
          <div
            key={p.title}
            className="kc-reveal kc-block rounded-2xl bg-white p-6 transition-transform duration-200 hover:-translate-y-1"
          >
            <span className={`inline-block size-9 rounded-lg border-2 border-ink ${accentBg[p.accent]}`} />
            <h3 className="mt-4 font-display text-xl font-bold text-ink">{p.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-ink/65">{p.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ------------------------------ What they learn ---------------------------- */
function Learn() {
  return (
    <section id="learn" className="scroll-mt-20 bg-ink">
      <div className="kc-dots">
        <div className="mx-auto max-w-6xl px-5 py-20 lg:py-28">
          <div className="kc-reveal max-w-xl">
            <p className="kc-eyebrow text-brand">// eight courses, two tracks</p>
            <h2 className="mt-3 font-display text-4xl font-extrabold leading-tight text-white sm:text-5xl">
              What your kid will actually learn.
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-white/65">
              A real curriculum, not a slideshow. Each module ends with something that runs — and goes home with them.
            </p>
          </div>

          <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {modules.map((m, i) => {
              const Icon = moduleIcons[i] ?? Blocks;
              return (
                <article
                  key={m.no}
                  className="kc-reveal group relative overflow-hidden rounded-2xl border-2 border-white/10 bg-white/[0.04] p-6 transition-colors duration-200 hover:bg-white/[0.07]"
                >
                  <div className="flex items-start justify-between">
                    <span className={`grid size-12 place-items-center rounded-xl border-2 border-ink ${accentBg[m.accent]} text-ink shadow-blockSm`}>
                      <Icon size={22} strokeWidth={2.4} />
                    </span>
                    <span className="font-code text-2xl font-bold text-white/15">{m.no}</span>
                  </div>
                  <span className={`mt-5 inline-block rounded-md px-2 py-0.5 font-code text-[0.68rem] font-bold ${accentTint[m.accent]}`}>
                    {m.tag}
                  </span>
                  <h3 className="mt-2 font-display text-xl font-bold text-white">{m.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-white/60">{m.body}</p>
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------- Who it's for ------------------------------ */
function Who() {
  return (
    <section id="who" className="mx-auto max-w-6xl scroll-mt-20 px-5 py-20 lg:py-28">
      <div className="kc-reveal max-w-xl">
        <SectionLabel>// who it's for</SectionLabel>
        <h2 className="mt-3 font-display text-4xl font-extrabold leading-tight text-ink sm:text-5xl">
          Three age groups. Every kid stretched.
        </h2>
        <p className="mt-4 text-lg leading-relaxed text-ink/70">
          We group children by age and pace, so beginners feel safe and returning coders stay challenged. All levels welcome.
        </p>
      </div>

      <div className="mt-12 grid gap-5 md:grid-cols-3">
        {tiers.map((t) => (
          <div key={t.name} className="kc-reveal kc-block overflow-hidden rounded-2xl bg-white">
            <div className={`flex items-center justify-between border-b-2 border-ink px-6 py-4 ${accentBg[t.accent]}`}>
              <h3 className="font-display text-2xl font-extrabold text-ink">{t.name}</h3>
              <span className="rounded-full border-2 border-ink bg-paper px-3 py-1 font-code text-xs font-bold text-ink">
                {t.age}
              </span>
            </div>
            <div className="p-6">
              <p className={`font-display text-lg font-bold ${accentText[t.accent]}`}>{t.focus}</p>
              <p className="mt-2 text-sm leading-relaxed text-ink/65">{t.note}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* --------------------------------- Tracks ---------------------------------- */
function Tracks() {
  return (
    <section id="tracks" className="scroll-mt-20 bg-white">
      <div className="mx-auto max-w-6xl px-5 py-20 lg:py-28">
        <div className="kc-reveal flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-xl">
            <SectionLabel>// pick your track</SectionLabel>
            <h2 className="mt-3 font-display text-4xl font-extrabold leading-tight text-ink sm:text-5xl">
              Two tracks. One bootcamp.
            </h2>
          </div>
          <div className="flex items-center gap-2 rounded-xl border-2 border-ink bg-paper px-4 py-2.5 font-code text-sm font-semibold text-ink">
            <Globe size={16} className="text-pop-blue" /> {event.format}
          </div>
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-2">
          {tracks.map((t) => (
            <div
              key={t.name}
              className="kc-reveal kc-block overflow-hidden rounded-2xl bg-paper"
            >
              <div className={`flex items-center justify-between border-b-2 border-ink px-6 py-4 ${accentBg[t.accent]}`}>
                <h3 className="font-display text-2xl font-extrabold text-ink">{t.name}</h3>
                <span className="rounded-full border-2 border-ink bg-paper px-3 py-1 font-code text-xs font-bold text-ink">
                  {t.duration}
                </span>
              </div>
              <div className="p-6">
                <p className={`font-code text-sm font-bold uppercase tracking-wider ${accentText[t.accent]}`}>{t.start}</p>
                <p className="mt-2 text-base leading-relaxed text-ink/70">{t.blurb}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------------------------- FAQ ------------------------------------ */
function Faq() {
  return (
    <section id="faq" className="mx-auto max-w-3xl scroll-mt-20 px-5 py-20 lg:py-28">
      <div className="kc-reveal text-center">
        <SectionLabel>// before you ask</SectionLabel>
        <h2 className="mt-3 font-display text-4xl font-extrabold leading-tight text-ink sm:text-5xl">
          Parent questions, answered.
        </h2>
      </div>

      <div className="mt-12 space-y-3">
        {faqs.map((f) => (
          <details
            key={f.q}
            className="kc-reveal group rounded-2xl border-2 border-ink/10 bg-white px-5 py-1 open:border-ink/25 open:bg-paper"
          >
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 font-display text-lg font-bold text-ink marker:hidden">
              {f.q}
              <span className="grid size-8 shrink-0 place-items-center rounded-lg border-2 border-ink bg-brand text-ink transition-transform duration-200 group-open:rotate-45">
                <Plus size={16} strokeWidth={3} />
              </span>
            </summary>
            <p className="pb-5 pr-12 text-base leading-relaxed text-ink/70">{f.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

/* -------------------------------- CTA band --------------------------------- */
function CtaBand() {
  return (
    <section className="mx-auto max-w-6xl px-5 pb-20 lg:pb-28">
      <div className="kc-dots relative overflow-hidden rounded-[2rem] border-2 border-ink bg-ink px-6 py-14 text-center shadow-badge sm:px-12 sm:py-20">
        <div aria-hidden className="pointer-events-none absolute -left-16 -top-16 h-64 w-64 rounded-full bg-brand/20 blur-3xl" />
        <p className="kc-eyebrow relative text-brand">// claim your seat</p>
        <h2 className="relative mx-auto mt-4 max-w-2xl font-display text-4xl font-extrabold leading-tight text-white sm:text-5xl">
          Reserve a spot — then make the badge to prove it.
        </h2>
        <p className="relative mx-auto mt-4 max-w-md text-lg text-white/65">
          {event.seatsLabel}. Register online, then generate your "I'm Attending" badge to share the countdown.
        </p>
        <div className="relative mt-9 flex flex-wrap justify-center gap-3">
          <a
            href={event.registerUrl}
            target="_blank"
            rel="noreferrer"
            className="kc-btn bg-brand text-ink hover:bg-brand-dark"
          >
            Register now <ArrowUpRight size={18} />
          </a>
          <Link to="/badge" className="kc-btn border-white/20 bg-white/10 text-white hover:bg-white/15">
            Generate your badge <ArrowRight size={17} />
          </Link>
        </div>
        <a
          href={`tel:${event.phone}`}
          className="relative mt-6 inline-flex items-center gap-2 font-code text-sm font-semibold text-white/75 hover:text-brand"
        >
          <Phone size={15} /> {event.phone}
        </a>
      </div>
    </section>
  );
}

export function LandingPage() {
  const ref = useReveal<HTMLDivElement>();
  return (
    <div ref={ref} className="kc min-h-screen">
      <SiteNav variant="landing" />
      <main>
        <Hero />
        <About />
        <Learn />
        <Who />
        <Tracks />
        <Faq />
        <CtaBand />
      </main>
      <SiteFooter />
    </div>
  );
}
