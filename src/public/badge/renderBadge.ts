/**
 * Badge renderer — the "I will be attending" Kids Coding Bootcamp badge.
 * =====================================================================
 * Composites the attendee's photo and name onto the pre-designed template and
 * exports a single flattened image (PNG/PDF). The template provides every static
 * element (logo, header, track cards, course list, QR, contacts); only the photo
 * and name change per attendee.
 *
 * Technique — "photo inside the circle, on top"
 * ---------------------------------------------
 * The template's photo slot is a round orange disk framed by a blue + yellow ring.
 * We stamp the opaque template FIRST, then draw the attendee's photo clipped to a
 * circle that exactly covers the orange disk. Because the clip is a true circle
 * (no corners) the edge is clean, and the ring — which sits just outside the disk —
 * stays visible and frames the photo. The name is drawn last, inside the blue pill.
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
import templateSrc from "@/public/DP_DESIGN_KIDS_CODING_BOOTCAMP_2026_B.png";

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
 * Circle the photo is drawn into (native px). Centre + radius were measured from
 * the template's orange disk (centre 316,428; radius ≈211). The photo is drawn at
 * radius 212 so it fully covers the disk's anti-aliased edge, leaving the blue +
 * yellow ring — which sits just outside — to frame it.
 */
const PHOTO_CIRCLE = { cx: 316, cy: 428, r: 212 } as const;

/**
 * Attendee name — Luckiest Guy 36pt, centred inside the blue pill. The pill is a
 * single line, so unlike the old design the name never wraps: it renders at 36px,
 * auto-shrinks a few steps for longer names, and truncates with an ellipsis as a
 * final guard so it can never spill past the pill.
 */
const NAME = {
  family: '"Luckiest Guy"',
  weight: 400,
  size: 36, // 36pt in the 1620px-tall design — matches the reference sample
  color: "#007eff", // brand blue for the attendee name
  centerX: 570, // horizontal centre of the pill
  centerY: 721, // vertical centre of the pill
  maxWidth: 560, // inner width of the pill, with a little breathing room
} as const;

/** Smallest the name is allowed to shrink to (as a fraction of `NAME.size`). */
const NAME_MIN_SCALE = 0.72;

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
 * Draw the badge into `canvas`. Order matters: opaque base → template → photo
 * (clipped to the circle, on top of the orange disk) → name.
 */
export function drawBadge(canvas: HTMLCanvasElement, input: BadgeInput) {
  canvas.width = CANVAS_W;
  canvas.height = CANVAS_H;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);
  ctx.fillStyle = BASE_FILL;
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

  if (templateReady()) ctx.drawImage(templateImg as HTMLImageElement, 0, 0, CANVAS_W, CANVAS_H);
  drawPhoto(ctx, input.photo);
  drawName(ctx, input.name);
}

/** Draw the photo on top of the orange disk, clipped to the circle. When no photo
 *  is supplied (e.g. the live preview) the template's own disk shows through. */
function drawPhoto(ctx: CanvasRenderingContext2D, photo: HTMLImageElement | null) {
  if (!photo) return;
  const { cx, cy, r } = PHOTO_CIRCLE;
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.clip();
  drawCover(ctx, photo, cx - r, cy - r, r * 2, r * 2);
  ctx.restore();
}

/** Render the attendee name on a single line inside the pill, auto-shrinking to fit. */
function drawName(ctx: CanvasRenderingContext2D, rawName: string) {
  const name = (rawName.trim() || "Your Name").toUpperCase();
  ctx.fillStyle = NAME.color;
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";

  const { text, size } = fitName(ctx, name);
  setNameFont(ctx, size);
  // Centre on the glyphs' actual cap height, not the font's em box — Luckiest Guy
  // has a tall internal em with no descenders, so "middle" sits visibly low.
  const m = ctx.measureText(text);
  const y = NAME.centerY + (m.actualBoundingBoxAscent - m.actualBoundingBoxDescent) / 2;
  ctx.fillText(text, NAME.centerX, y);
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

type FittedName = { text: string; size: number };

/**
 * Fit the name on ONE line within `NAME.maxWidth`: try the full 36pt, shrink
 * through a few steps down to `NAME_MIN_SCALE`, then truncate with an ellipsis so
 * it can never overflow the pill.
 */
function fitName(ctx: CanvasRenderingContext2D, name: string): FittedName {
  const steps = [1, 0.92, 0.85, 0.78, NAME_MIN_SCALE];
  for (const factor of steps) {
    const size = NAME.size * factor;
    setNameFont(ctx, size);
    if (ctx.measureText(name).width <= NAME.maxWidth) return { text: name, size };
  }
  const size = NAME.size * NAME_MIN_SCALE;
  setNameFont(ctx, size);
  return { text: ellipsize(ctx, name, NAME.maxWidth), size };
}

function setNameFont(ctx: CanvasRenderingContext2D, size: number) {
  ctx.font = `${NAME.weight} ${size}px ${NAME.family}`;
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
