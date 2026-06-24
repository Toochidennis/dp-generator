import type { Accent } from "@/public/data/event";
import { accentBg } from "@/public/lib/accents";

/** A Scratch-style command block — the microsite's signature motif. */
export function CodeChip({
  label,
  accent,
  rot = 0,
  notch = true,
  float,
  className = "",
}: {
  label: string;
  accent: Accent;
  rot?: number;
  notch?: boolean;
  float?: "" | "slow" | "rev";
  className?: string;
}) {
  return (
    <span
      style={{ ["--kc-rot" as string]: `${rot}deg`, transform: `rotate(${rot}deg)` }}
      className={`kc-block ${notch ? "kc-block--notch" : ""} ${accentBg[accent]} ${
        float !== undefined ? `kc-float ${float ? `kc-float--${float}` : ""}` : ""
      } inline-flex items-center gap-2 px-3.5 py-2 font-code text-sm font-bold text-ink ${className}`}
    >
      {label}
    </span>
  );
}
