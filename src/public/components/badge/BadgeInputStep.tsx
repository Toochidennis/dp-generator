import { ArrowRight, Check, ImagePlus, Sparkles, Trash2 } from "lucide-react";
import { event } from "@/public/data/event";
import { type BadgeStudio, MAX_PHOTO_MB } from "@/public/hooks/useBadgeStudio";
import { StepDots } from "@/public/components/badge/StepDots";

/** Step 1 — collect the attendee's name and photo. */
export function BadgeInputStep({ studio }: { studio: BadgeStudio }) {
  const { name, photo, photoName, error, canGenerate } = studio;

  return (
    <div className="kc-step-in">
      <div className="text-center">
        <span className="inline-flex items-center gap-2 rounded-full border-2 border-ink/10 bg-white px-3.5 py-1.5">
          <Sparkles size={15} className="text-brand" />
          <span className="kc-eyebrow text-[0.66rem]">Step 1 of 2 · Your details</span>
        </span>
        <h1 className="mt-5 font-display text-4xl font-extrabold leading-[1.02] text-ink sm:text-5xl">
          Let's make your badge.
        </h1>
        <p className="mx-auto mt-4 max-w-md text-lg leading-relaxed text-ink/70">
          Two quick details and we'll generate your official "I'm Attending" badge for {event.name} {event.year}.
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
            <span className="kc-eyebrow mb-2 block text-ink/55">Attendee name</span>
            <input
              type="text"
              value={name}
              onChange={(e) => studio.setName(e.target.value)}
              placeholder="e.g. Ada Okafor"
              maxLength={40}
              autoComplete="name"
              autoFocus
              className="w-full rounded-xl border-2 border-ink/15 bg-paper px-4 py-3 text-base font-semibold text-ink outline-none transition placeholder:font-normal placeholder:text-ink/35 focus:border-pop-blue focus:bg-white"
            />
          </label>

          <label className="block">
            <span className="kc-eyebrow mb-2 block text-ink/55">Photo</span>
            <input
              ref={studio.refs.fileRef}
              type="file"
              accept="image/*"
              onChange={(e) => studio.onPickPhoto(e.target.files?.[0])}
              className="sr-only"
              id="badge-photo"
            />
            {photo ? (
              <div className="flex items-center justify-between gap-3 rounded-xl border-2 border-pop-mint/40 bg-pop-mint/10 px-4 py-3">
                <span className="flex min-w-0 items-center gap-2 text-sm font-semibold text-ink">
                  <Check size={16} className="shrink-0 text-pop-mint" />
                  <span className="truncate">{photoName}</span>
                </span>
                <button
                  type="button"
                  onClick={studio.removePhoto}
                  className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border-2 border-ink/15 bg-white px-2.5 py-1.5 text-xs font-bold text-ink hover:border-pop-coral hover:text-pop-coral"
                >
                  <Trash2 size={14} /> Remove
                </button>
              </div>
            ) : (
              <label
                htmlFor="badge-photo"
                className="flex cursor-pointer items-center gap-3 rounded-xl border-2 border-dashed border-ink/25 bg-paper px-4 py-4 text-ink/70 transition hover:border-pop-blue hover:bg-white"
              >
                <span className="grid size-10 place-items-center rounded-lg border-2 border-ink bg-brand text-ink">
                  <ImagePlus size={18} />
                </span>
                <span className="text-sm font-semibold">Upload a photo</span>
              </label>
            )}
            <span className="mt-1.5 block text-xs text-ink/45">
              JPG or PNG, up to {MAX_PHOTO_MB}MB. Required to generate your badge.
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
            Generate my badge <ArrowRight size={18} />
          </button>
        </div>
      </form>
    </div>
  );
}
