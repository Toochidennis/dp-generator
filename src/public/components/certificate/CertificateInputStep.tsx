import { ArrowRight, GraduationCap } from "lucide-react";
import { event } from "@/public/data/event";
import { type CertificateStudio } from "@/public/hooks/useCertificateStudio";
import { StepDots } from "@/public/components/badge/StepDots";

/** Step 1 — collect the recipient's name. */
export function CertificateInputStep({ studio }: { studio: CertificateStudio }) {
  const { name, error, canGenerate, maxNameLen } = studio;

  return (
    <div className="kc-step-in">
      <div className="text-center">
        <span className="inline-flex items-center gap-2 rounded-full border-2 border-ink/10 bg-white px-3.5 py-1.5">
          <GraduationCap size={15} className="text-brand" />
          <span className="kc-eyebrow text-[0.66rem]">Step 1 of 2 · Your name</span>
        </span>
        <h1 className="mt-5 font-display text-4xl font-extrabold leading-[1.02] text-ink sm:text-5xl">
          Claim your certificate.
        </h1>
        <p className="mx-auto mt-4 max-w-md text-lg leading-relaxed text-ink/70">
          Completed {event.name} {event.year}? Add your name and we'll generate your certificate of participation.
        </p>
        <div className="mt-6 flex justify-center">
          <StepDots step="input" />
        </div>
      </div>

      <form
        className="mt-9"
        onSubmit={(e) => {
          e.preventDefault();
          studio.onGenerate();
        }}
      >
        <div className="kc-block space-y-6 rounded-3xl bg-white p-6 sm:p-8">
          <label className="block">
            <span className="kc-eyebrow mb-2 block text-ink/55">Full name</span>
            <input
              type="text"
              value={name}
              onChange={(e) => studio.setName(e.target.value)}
              placeholder="e.g. Ada Okafor"
              maxLength={maxNameLen}
              autoComplete="name"
              autoFocus
              className="w-full rounded-xl border-2 border-ink/15 bg-paper px-4 py-3 text-base font-semibold text-ink outline-none transition placeholder:font-normal placeholder:text-ink/35 focus:border-pop-blue focus:bg-white"
            />
            <span className="mt-1.5 block text-xs text-ink/45">
              This is exactly how your name will appear on the certificate.
            </span>
          </label>

          {error && (
            <p role="alert" className="rounded-xl bg-pop-coral/10 px-4 py-2.5 text-sm font-semibold text-pop-coral">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={!canGenerate}
            className="kc-btn w-full justify-center bg-brand text-base text-ink hover:bg-brand-dark disabled:cursor-not-allowed disabled:bg-ink/15 disabled:text-ink/40 disabled:shadow-none disabled:hover:bg-ink/15"
          >
            Generate my certificate <ArrowRight size={18} />
          </button>
        </div>
      </form>
    </div>
  );
}
