/**
 * Certificate renderer — the Kids Coding Bootcamp certificate of participation.
 * ============================================================================
 * Mirrors the badge flow (see badge/renderBadge.ts): it composites the
 * recipient's name onto the pre-designed certificate template and exports a flat
 * image. The template supplies everything else (title, body, date, signature);
 * only the name is dynamic, rendered on the printed rule under "Proudly
 * Presented to".
 *
 * Coordinate system: native template pixels (4000 × 2827, the full-resolution
 * image extracted from the supplied SVG), which is also the canvas backing-store
 * size, so the numbers map 1:1 to measurements taken from the design and the
 * exported certificate is print-grade.
 */
import templateSrc from "@/public/CERTIFICATE_KIDS_CODING_BOOTCAMP_2026.jpg";
import { event } from "@/public/data/event";

export type CertificateInput = { name: string };

/** Native render resolution — equals the template image's pixel size (print-grade). */
const CANVAS_W = 4000;
const CANVAS_H = 2827;

/** Opaque base; only visible if the template fails to load. */
const BASE_FILL = "#EEF1F8";

/**
 * Recipient name — Bricolage Bold (already loaded site-wide), centred on the
 * printed rule. Geometry measured from the template, in native px: the rule sits
 * at y≈1626 spanning x[1254,2927] (centre 2090).
 */
const NAME = {
  family: '"Bricolage Grotesque"',
  weight: 700,
  size: 120,
  minSize: 67,
  color: "#141C34",
  centerX: 2090,
  baselineY: 1600, // ~26px above the rule
  maxWidth: 1633, // a touch under the rule's width
} as const;

/* ----------------------------- asset loading ------------------------------ */

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
export async function ensureCertificateAssets(): Promise<void> {
  const tasks: Promise<unknown>[] = [loadTemplate()];
  if ("fonts" in document) {
    tasks.push(document.fonts.load(`${NAME.weight} ${NAME.size}px ${NAME.family}`).catch(() => undefined));
  }
  await Promise.all(tasks);
}

/* -------------------------------- drawing --------------------------------- */

/** Draw the certificate into `canvas`: opaque base → template → name. */
export function drawCertificate(canvas: HTMLCanvasElement, input: CertificateInput) {
  canvas.width = CANVAS_W;
  canvas.height = CANVAS_H;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);
  ctx.fillStyle = BASE_FILL;
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

  if (templateReady()) ctx.drawImage(templateImg as HTMLImageElement, 0, 0, CANVAS_W, CANVAS_H);

  drawName(ctx, input.name);
}

/** Render the recipient name centred on the rule, shrinking to fit one line. */
function drawName(ctx: CanvasRenderingContext2D, rawName: string) {
  const name = rawName.trim() || "Your Name";
  ctx.fillStyle = NAME.color;
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";

  let size = NAME.size;
  while (size > NAME.minSize) {
    ctx.font = `${NAME.weight} ${size}px ${NAME.family}`;
    if (ctx.measureText(name).width <= NAME.maxWidth) break;
    size -= 2;
  }
  ctx.font = `${NAME.weight} ${size}px ${NAME.family}`;
  const text = ctx.measureText(name).width <= NAME.maxWidth ? name : ellipsize(ctx, name, NAME.maxWidth);
  ctx.fillText(text, NAME.centerX, NAME.baselineY);
}

function ellipsize(ctx: CanvasRenderingContext2D, text: string, maxW: number): string {
  if (ctx.measureText(text).width <= maxW) return text;
  let t = text;
  while (t.length > 1 && ctx.measureText(`${t}…`).width > maxW) t = t.slice(0, -1);
  return `${t}…`;
}

/* --------------------------------- export --------------------------------- */

function fileSafe(name: string): string {
  return (name.trim() || "recipient").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function certificateFilename(name: string, ext: "png" | "pdf" = "png"): string {
  return `kids-coding-bootcamp-certificate-${fileSafe(name)}.${ext}`;
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
  return new File([blob], certificateFilename(name), { type: "image/png" });
}

function triggerDownload(url: string, filename: string) {
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

/** Download the certificate as a PNG (used as the desktop share fallback). */
export async function downloadPng(canvas: HTMLCanvasElement, name: string) {
  const blob = await canvasToBlob(canvas);
  const url = URL.createObjectURL(blob);
  triggerDownload(url, certificateFilename(name));
  URL.revokeObjectURL(url);
}

/**
 * Download the certificate as a single-page landscape PDF. The page is sized to
 * the certificate's exact ratio (≈ A4 landscape), so it fills the page edge to
 * edge. A high-quality JPEG keeps the PDF small for a photographic design.
 */
export async function downloadPdf(canvas: HTMLCanvasElement, name: string) {
  const { jsPDF } = await import("jspdf"); // lazy — keep jspdf off the initial bundle
  const wmm = 297; // A4 landscape width
  const hmm = (wmm * CANVAS_H) / CANVAS_W; // ≈ 209.9mm, matching the cert ratio
  const pdf = new jsPDF({ orientation: "landscape", unit: "mm", format: [wmm, hmm], compress: true });
  pdf.addImage(canvas.toDataURL("image/jpeg", 0.92), "JPEG", 0, 0, wmm, hmm);
  pdf.save(certificateFilename(name, "pdf"));
}

/* --------------------------------- share ---------------------------------- */

export type ShareResult = "shared" | "cancelled" | "unsupported";

const shareText = `I completed the ${event.name} ${event.year}! 🎓`;
const shareUrl = typeof window !== "undefined" ? window.location.origin : "";

/** Share the certificate via the native share sheet (phones); "unsupported" on
 *  browsers that can't share files so the caller can fall back to a download. */
export async function shareCertificateImage(canvas: HTMLCanvasElement, name: string): Promise<ShareResult> {
  if (typeof navigator === "undefined" || !navigator.share) return "unsupported";
  try {
    const file = await canvasToFile(canvas, name);
    const data: ShareData = { files: [file], title: `${event.name} ${event.year} — Certificate`, text: shareText, url: shareUrl };
    if (navigator.canShare && !navigator.canShare(data)) return "unsupported";
    await navigator.share(data);
    return "shared";
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") return "cancelled";
    return "unsupported";
  }
}
