import { canvasToFile } from "@/public/badge/renderBadge";
import { event } from "@/public/data/event";

export type ShareResult = "shared" | "cancelled" | "unsupported";

const shareText = `I'm attending ${event.name} ${event.year}! 🚀 ${event.tagline}`;
const shareUrl = typeof window !== "undefined" ? window.location.origin : "";

/**
 * Share the badge image through the native Web Share API — on phones this opens
 * the OS share sheet, letting the user pick any installed app (WhatsApp, IG, etc.).
 * Returns "unsupported" when the browser can't share files (mostly desktop), so
 * the caller can fall back to a plain download.
 */
export async function shareBadgeImage(canvas: HTMLCanvasElement, name: string): Promise<ShareResult> {
  if (typeof navigator === "undefined" || !navigator.share) return "unsupported";
  try {
    const file = await canvasToFile(canvas, name);
    const data: ShareData = { files: [file], title: `${event.name} ${event.year}`, text: shareText, url: shareUrl };
    if (navigator.canShare && !navigator.canShare(data)) return "unsupported";
    await navigator.share(data);
    return "shared";
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") return "cancelled";
    return "unsupported";
  }
}
