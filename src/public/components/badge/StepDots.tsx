import type { Step } from "@/public/hooks/useBadgeStudio";

/** Two-dot progress indicator for the badge generator flow. */
export function StepDots({ step }: { step: Step }) {
  return (
    <span className="inline-flex items-center gap-1.5" aria-hidden>
      <span className={`h-1.5 rounded-full transition-all ${step === "input" ? "w-6 bg-brand" : "w-1.5 bg-ink/25"}`} />
      <span className={`h-1.5 rounded-full transition-all ${step === "result" ? "w-6 bg-brand" : "w-1.5 bg-ink/25"}`} />
    </span>
  );
}
