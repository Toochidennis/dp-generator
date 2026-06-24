import { Link } from "react-router-dom";
import { ArrowUpRight, Calendar, Instagram, MapPin, Phone } from "lucide-react";
import { event, footerLinks } from "@/public/data/event";

export function SiteFooter() {
  return (
    <footer className="kc-dots bg-ink text-white">
      <div className="mx-auto max-w-6xl px-5 py-16">
        <div className="grid gap-12 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <span className="inline-flex items-center rounded-xl border-2 border-white/15 bg-white/5 px-3 py-2">
              <img src="/digital-dreams-logo.png" alt="Digital Dreams" className="h-7 w-auto object-contain" />
            </span>
            <p className="mt-5 max-w-sm text-sm leading-7 text-white/65">
              {event.name} is run by {event.brand} — a top-10 Nigerian ICT firm training developers since 2007.
            </p>
            <p className="kc-eyebrow mt-5 text-brand">{event.brandTagline}</p>
          </div>

          <nav aria-label="Footer">
            <p className="kc-eyebrow text-white/40">Explore</p>
            <ul className="mt-4 space-y-2.5">
              {footerLinks.map((l) => (
                <li key={l.href}>
                  <a href={l.href} className="text-sm font-semibold text-white/75 hover:text-brand">
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <p className="kc-eyebrow text-white/40">Details</p>
            <ul className="mt-4 space-y-3 text-sm text-white/75">
              <li className="flex items-start gap-2.5">
                <Calendar size={16} className="mt-0.5 shrink-0 text-brand" />
                <span>
                  {event.dateLabel}
                  <br />
                  {event.timeLabel}
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <MapPin size={16} className="mt-0.5 shrink-0 text-brand" />
                <span>
                  {event.venue}
                  <br />
                  {event.venueAddress}
                </span>
              </li>
              <li>
                <a href={`tel:${event.phone}`} className="flex items-center gap-2.5 hover:text-brand">
                  <Phone size={16} className="shrink-0 text-brand" />
                  {event.phone}
                </a>
              </li>
              <li>
                <a
                  href={`https://instagram.com/${event.social}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2.5 hover:text-brand"
                >
                  <Instagram size={16} className="shrink-0 text-brand" />
                  {event.social}
                </a>
              </li>
            </ul>
            <Link
              to="/badge"
              className="kc-btn mt-6 border-white/0 bg-brand text-ink text-sm shadow-[0_5px_0_0_#000] hover:bg-brand-dark"
            >
              Generate your badge <ArrowUpRight size={16} />
            </Link>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-2 border-t-2 border-white/10 pt-6 text-xs text-white/45 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {event.year} {event.brand}. Built for curious kids.
          </p>
          <p className="font-code">{event.dateShort} · {event.venueAddress}</p>
        </div>
      </div>
    </footer>
  );
}
