import type { Accent } from "@/public/data/event";

// Base brand neutrals. These mirror the Tailwind tokens in tailwind.config.js
// and are the canonical hex values for non-Tailwind contexts (e.g. the canvas
// badge renderer), so colors never drift between CSS, Tailwind, and canvas.
export const INK = "#0E1428";
export const WHITE = "#FFFFFF";

// Single source of truth mapping an accent name to its concrete values, so the
// palette never drifts between the page, the blocks, and the badge canvas.
export const ACCENT_HEX: Record<Accent, string> = {
  brand: "#F8A018",
  blue: "#2E6BE6",
  mint: "#18B486",
  coral: "#FF5C49",
};

export const accentBg: Record<Accent, string> = {
  brand: "bg-brand",
  blue: "bg-pop-blue",
  mint: "bg-pop-mint",
  coral: "bg-pop-coral",
};

export const accentText: Record<Accent, string> = {
  brand: "text-brand",
  blue: "text-pop-blue",
  mint: "text-pop-mint",
  coral: "text-pop-coral",
};

// Light tint chip backgrounds (used behind module tags etc.)
export const accentTint: Record<Accent, string> = {
  brand: "bg-brand/15 text-brand-dark",
  blue: "bg-pop-blue/15 text-pop-blue",
  mint: "bg-pop-mint/15 text-pop-mint",
  coral: "bg-pop-coral/15 text-pop-coral",
};
