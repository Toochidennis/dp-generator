import confetti from "canvas-confetti";
import { ACCENT_HEX } from "@/public/lib/accents";

const BRAND_COLORS = [ACCENT_HEX.brand, ACCENT_HEX.blue, ACCENT_HEX.mint, ACCENT_HEX.coral, "#FFFFFF"];

/**
 * A single celebratory burst in the brand palette — fired once on the badge
 * reveal. Two angled cannons converge toward the centre for a "pop" feel.
 * Skipped entirely when the user prefers reduced motion.
 */
export function celebrate() {
  if (typeof window === "undefined") return;
  if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;

  const base: confetti.Options = {
    particleCount: 70,
    spread: 70,
    startVelocity: 52,
    ticks: 220,
    gravity: 0.95,
    scalar: 1.05,
    colors: BRAND_COLORS,
    zIndex: 70,
    disableForReducedMotion: true,
  };

  // left + right cannons aimed inward
  confetti({ ...base, angle: 60, origin: { x: 0.08, y: 0.7 } });
  confetti({ ...base, angle: 120, origin: { x: 0.92, y: 0.7 } });

  // a softer top-centre shower a beat later
  window.setTimeout(() => {
    confetti({
      ...base,
      particleCount: 50,
      angle: 90,
      spread: 100,
      startVelocity: 40,
      origin: { x: 0.5, y: 0.2 },
    });
  }, 180);
}
