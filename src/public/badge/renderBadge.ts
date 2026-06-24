/**
 * Badge renderer — the "I will be attending" Kids Coding Bootcamp badge.
 * =====================================================================
 * Composites the attendee's photo and name onto the pre-designed template and
 * exports a single flattened image (PNG/PDF). The template provides every static
 * element (logo, header, track cards, course list, QR, contacts); only the photo
 * and name change per attendee.
 *
 * Technique — "photo behind a cutout"
 * -----------------------------------
 * The template's photo slot (originally a solid blue box) has been knocked out to
 * a transparent hole in the `*_cutout.png` asset. We paint the attendee's photo
 * FIRST, then stamp the opaque template ON TOP. The photo shows only through the
 * hole, framed by the template's orange border. Consequences:
 *   • The rounded-corner shape comes entirely from the template art, so the photo
 *     can never reveal a sliver of the slot at its corners (a problem the earlier
 *     "rounded-clip on top" approach suffered from).
 *   • The orange border always stays crisp on top of the photo edges.
 * See `scripts/generate-badge-cutout.py` for how the cutout asset is produced.
 *
 * Coordinate system
 * -----------------
 * All geometry is in the template's NATIVE pixel space (1140 × 1620, the exact
 * size of the template image). That is also the canvas backing-store size, so the
 * numbers below map 1:1 to measurements taken from the design.
 *
 * Clean, flat export
 * ------------------
 * Drawing starts with an opaque base fill and the template is fully opaque, so the
 * exported PNG/PDF has no transparency, seams, or layers. We use the PNG template
 * (not the source SVG) because drawing an SVG onto a canvas can taint it and break
 * `toBlob`/`toDataURL` export.
 */
import templateSrc from "@/public/DP_DESIGN_KIDS_CODING_BOOTCAMP_2026_cutout.png";

export type BadgeInput = {
  name: string;
  photo: HTMLImageElement | null;
};

/* ------------------------------- dimensions ------------------------------- */

/** Logical/display size — exported for the preview's CSS aspect-ratio and the PDF. */
export const BADGE_W = 380;
export const BADGE_H = 540;

/** Backing store renders at 3× the logical size, matching the 1140 × 1620 art. */
const RENDER_SCALE = 3;
const CANVAS_W = BADGE_W * RENDER_SCALE; // 1140 — native template px
const CANVAS_H = BADGE_H * RENDER_SCALE; // 1620

/* --------------------------------- layout --------------------------------- */

/** Opaque base; only visible if the template image fails to load. */
const BASE_FILL = "#EEF1F8";

/**
 * Rectangle the photo is painted into (native px). It is slightly larger than the
 * transparent hole — measured at x[121,503] y[596,978] — so the photo fully backs
 * the hole's anti-aliased rounded corners; the template stamped on top hides the
 * ~7px of overflow. Kept centred on the hole (centre 312, 787).
 */
const PHOTO_SLOT = { x: 114, y: 589, w: 396, h: 396 };

/** Shown inside the slot when no photo is supplied (e.g. the live preview). */
const PHOTO_PLACEHOLDER = "#D6DCEA";

/** Attendee name — Montserrat SemiBold, centred under the photo slot. */
const NAME = {
  family: '"Montserrat"',
  weight: 600,
  size: 48, // 48pt in the 1620px-tall design (≈2.96% of height)
  color: "#0040DC", // eyedropped from "Kate Okonkwo" in the reference sample
  centerX: 312, // horizontal centre of the photo slot
  centerY: 1037, // ~60px below the slot — matches the reference sample
  maxWidth: 410, // keep within the left column, clear of the track cards
  lineHeight: 1.16,
} as const;

/* ----------------------------- asset loading ------------------------------ */

// The template art is loaded once and reused for every draw.
let templateImg: HTMLImageElement | null = null;
let templatePromise: Promise<void> | null = null;

function loadTemplate(): Promise<void> {
  if (templatePromise) return templatePromise;
  templatePromise = new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      templateImg = img;
      resolve();
    };
    img.onerror = () => resolve(); // fall back to the plain base fill if it fails
    img.src = templateSrc;
  });
  return templatePromise;
}

function templateReady(): boolean {
  return !!templateImg && templateImg.complete && templateImg.naturalWidth > 0;
}

/** Ensure the template art and the name font are loaded before drawing. */
export async function ensureBadgeAssets(): Promise<void> {
  const tasks: Promise<unknown>[] = [loadTemplate()];
  if ("fonts" in document) {
    tasks.push(document.fonts.load(`${NAME.weight} ${NAME.size}px ${NAME.family}`).catch(() => undefined));
  }
  await Promise.all(tasks);
}

/* -------------------------------- drawing --------------------------------- */

/**
 * Draw the badge into `canvas`. Order matters: opaque base → photo → template
 * (which masks the photo to the slot) → name.
 */
export function drawBadge(canvas: HTMLCanvasElement, input: BadgeInput) {
  canvas.width = CANVAS_W;
  canvas.height = CANVAS_H;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);
  ctx.fillStyle = BASE_FILL;
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

  drawPhoto(ctx, input.photo);
  if (templateReady()) ctx.drawImage(templateImg as HTMLImageElement, 0, 0, CANVAS_W, CANVAS_H);
  drawName(ctx, input.name);
}

/** Paint the photo into the slot (behind the template). Clipped to a plain rect —
 *  the rounded corners come from the cutout, so nothing can leak at the edges. */
function drawPhoto(ctx: CanvasRenderingContext2D, photo: HTMLImageElement | null) {
  const { x, y, w, h } = PHOTO_SLOT;
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();
  if (photo) {
    drawCover(ctx, photo, x, y, w, h);
  } else {
    ctx.fillStyle = PHOTO_PLACEHOLDER;
    ctx.fillRect(x, y, w, h);
  }
  ctx.restore();
}

/** Render the attendee name, centred and vertically balanced over one or two lines. */
function drawName(ctx: CanvasRenderingContext2D, rawName: string) {
  const name = rawName.trim() || "Your Name";
  ctx.fillStyle = NAME.color;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  const { lines, size } = fitName(ctx, name);
  const lineH = size * NAME.lineHeight;
  const top = NAME.centerY - ((lines.length - 1) * lineH) / 2;
  lines.forEach((line, i) => ctx.fillText(line, NAME.centerX, top + i * lineH));
}

/* --------------------------------- helpers -------------------------------- */

/** Draw `img` to fill `w × h` with a centred crop (CSS `object-fit: cover`). */
function drawCover(ctx: CanvasRenderingContext2D, img: HTMLImageElement, x: number, y: number, w: number, h: number) {
  const imgRatio = img.width / img.height;
  const boxRatio = w / h;
  let dw = w;
  let dh = h;
  let dx = x;
  let dy = y;
  if (imgRatio > boxRatio) {
    dw = h * imgRatio;
    dx = x - (dw - w) / 2;
  } else {
    dh = w / imgRatio;
    dy = y - (dh - h) / 2;
  }
  ctx.drawImage(img, dx, dy, dw, dh);
}

type FittedName = { lines: string[]; size: number };

/**
 * Fit the name within `NAME.maxWidth`: try the full size on one line, then a
 * two-line split, shrinking through a few steps; finally truncate with an ellipsis.
 */
function fitName(ctx: CanvasRenderingContext2D, name: string): FittedName {
  const steps = [1, 0.875, 0.75, 0.6875];
  for (const factor of steps) {
    const size = NAME.size * factor;
    setNameFont(ctx, size);
    if (ctx.measureText(name).width <= NAME.maxWidth) return { lines: [name], size };
    const split = splitTwoLines(ctx, name, NAME.maxWidth);
    if (split) return { lines: split, size };
  }
  const size = NAME.size * steps[steps.length - 1];
  setNameFont(ctx, size);
  return { lines: [ellipsize(ctx, name, NAME.maxWidth)], size };
}

function setNameFont(ctx: CanvasRenderingContext2D, size: number) {
  ctx.font = `${NAME.weight} ${size}px ${NAME.family}`;
}

/** Split a multi-word name into two lines that each fit `maxW`, or null if impossible. */
function splitTwoLines(ctx: CanvasRenderingContext2D, name: string, maxW: number): [string, string] | null {
  const words = name.split(/\s+/);
  for (let i = 1; i < words.length; i++) {
    const a = words.slice(0, i).join(" ");
    const b = words.slice(i).join(" ");
    if (ctx.measureText(a).width <= maxW && ctx.measureText(b).width <= maxW) return [a, b];
  }
  return null;
}

/** Trim `text` with a trailing ellipsis until it fits `maxW`. */
function ellipsize(ctx: CanvasRenderingContext2D, text: string, maxW: number): string {
  if (ctx.measureText(text).width <= maxW) return text;
  let t = text;
  while (t.length > 1 && ctx.measureText(`${t}…`).width > maxW) t = t.slice(0, -1);
  return `${t}…`;
}

/* --------------------------------- export --------------------------------- */

/** Filesystem-safe slug for download filenames. */
function fileSafe(name: string): string {
  return (name.trim() || "attendee").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function badgeFilename(name: string): string {
  return `kids-coding-bootcamp-badge-${fileSafe(name)}.png`;
}

/** Resolve the canvas to a PNG Blob. */
export function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("Could not render image"))), "image/png");
  });
}

/** Resolve the canvas to a PNG File (used by the Web Share API). */
export async function canvasToFile(canvas: HTMLCanvasElement, name: string): Promise<File> {
  const blob = await canvasToBlob(canvas);
  return new File([blob], badgeFilename(name), { type: "image/png" });
}

function triggerDownload(url: string, filename: string) {
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

/** Download the badge as a PNG. */
export async function downloadPng(canvas: HTMLCanvasElement, name: string) {
  const blob = await canvasToBlob(canvas);
  const url = URL.createObjectURL(blob);
  triggerDownload(url, badgeFilename(name));
  URL.revokeObjectURL(url);
}
