// Non-official attendance artwork composer.
//
// The OFFICIAL PDF/image is produced by the backend. This composer only
// renders a client-side preview, and is also used by the mock service to
// produce downloadable artifacts while the backend is being built.

import { jsPDF } from "jspdf";

export type ComposeOptions = {
  programTitle: string;
  /** Already-interpolated attendance sentence, e.g. "Jerry is attending X". */
  attendanceText: string;
  participantName: string;
  dateLabel?: string;
  photoUrl?: string;
  style?: AttendanceCardStyle;
};

export type AttendanceCardStyle = "classic" | "minimal" | "dreams";

const SIZE = 1080;

export function styleForTemplate(templateId?: string, templateName?: string): AttendanceCardStyle {
  const descriptor = `${templateId ?? ""} ${templateName ?? ""}`.toLowerCase();
  if (templateId === "temp_002" || descriptor.includes("minimal")) return "minimal";
  if (templateId === "temp_005" || descriptor.includes("signature") || descriptor.includes("dreams")) return "dreams";
  return "classic";
}

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Could not load image."));
    image.src = url;
  });
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "DP";
  return (parts[0][0] + (parts[1]?.[0] ?? "")).toUpperCase();
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (ctx.measureText(candidate).width > maxWidth && current) {
      lines.push(current);
      current = word;
    } else {
      current = candidate;
    }
  }
  if (current) lines.push(current);
  return lines;
}

function fitFontSize(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  initialSize: number,
  minSize: number,
  weight = "900",
  family = "Manrope, Arial, sans-serif",
) {
  let size = initialSize;
  while (size > minSize) {
    ctx.font = `${weight} ${size}px ${family}`;
    if (ctx.measureText(text).width <= maxWidth) return size;
    size -= 2;
  }
  return minSize;
}

function drawQrMotif(ctx: CanvasRenderingContext2D, x: number, y: number, scale = 1) {
  const cells = [
    [0, 0, 2, 2, "#071b33"],
    [3.2, 0, 1.2, 1.2, "#159568"],
    [5.6, 0, 1, 3.4, "#071b33"],
    [0, 3.4, 1.4, 3, "#159568"],
    [2.8, 2.8, 2, 2, "#071b33"],
    [5.6, 5, 1, 1.4, "#159568"],
  ] as const;

  ctx.fillStyle = "#ffffff";
  roundRect(ctx, x, y, 136 * scale, 136 * scale, 20 * scale);
  ctx.fill();
  for (const [cx, cy, cw, ch, color] of cells) {
    ctx.fillStyle = color;
    ctx.fillRect(x + (24 + cx * 12) * scale, y + (24 + cy * 12) * scale, cw * 12 * scale, ch * 12 * scale);
  }
}

export async function composeAttendanceCanvas(opts: ComposeOptions): Promise<HTMLCanvasElement> {
  const canvas = document.createElement("canvas");
  canvas.width = SIZE;
  canvas.height = SIZE;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas is not supported in this browser.");

  if (opts.style === "classic") {
    await renderClassicCard(ctx, opts);
    return canvas;
  }

  if (opts.style === "minimal") {
    await renderMinimalCard(ctx, opts);
    return canvas;
  }

  ctx.fillStyle = "#f8fbf7";
  ctx.fillRect(0, 0, SIZE, SIZE);

  const margin = 56;
  const cardSize = SIZE - margin * 2;
  const cardGradient = ctx.createLinearGradient(margin, margin, SIZE - margin, SIZE - margin);
  cardGradient.addColorStop(0, "#071b33");
  cardGradient.addColorStop(0.58, "#0b2f4f");
  cardGradient.addColorStop(1, "#159568");

  ctx.save();
  ctx.shadowColor = "rgba(3,21,38,0.35)";
  ctx.shadowBlur = 42;
  ctx.shadowOffsetY = 24;
  ctx.fillStyle = cardGradient;
  roundRect(ctx, margin, margin, cardSize, cardSize, 60);
  ctx.fill();
  ctx.restore();

  ctx.save();
  roundRect(ctx, margin, margin, cardSize, cardSize, 60);
  ctx.clip();

  ctx.fillStyle = "rgba(255,255,255,0.08)";
  ctx.beginPath();
  ctx.arc(SIZE - 118, 130, 204, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "rgba(25,181,108,0.13)";
  ctx.beginPath();
  ctx.arc(130, SIZE - 126, 242, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "rgba(25,181,108,0.32)";
  ctx.beginPath();
  ctx.moveTo(margin, 766);
  ctx.bezierCurveTo(250, 714, 392, 808, 590, 748);
  ctx.bezierCurveTo(752, 700, 850, 748, SIZE - margin, 666);
  ctx.lineTo(SIZE - margin, SIZE - margin);
  ctx.lineTo(margin, SIZE - margin);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "left";
  ctx.font = "800 32px Manrope, Arial, sans-serif";
  ctx.fillText("DIGITAL DREAMS ICT ACADEMY", 110, 142);

  ctx.fillStyle = "#ffffff";
  roundRect(ctx, 110, 170, 245, 46, 23);
  ctx.fill();
  ctx.fillStyle = "#128d55";
  ctx.textAlign = "center";
  ctx.font = "800 16px 'DM Sans', Arial, sans-serif";
  ctx.fillText("PROGRAM ATTENDANCE", 232, 200);

  drawQrMotif(ctx, SIZE - 236, 105, 1);
  ctx.fillStyle = "#a7f3c2";
  ctx.font = "800 14px 'DM Sans', Arial, sans-serif";
  ctx.fillText("SHARE CARD", SIZE - 168, 268);

  const avatarRadius = 214;
  const avatarY = 500;
  const avatarX = SIZE / 2;
  ctx.fillStyle = "rgba(255,255,255,0.22)";
  ctx.beginPath();
  ctx.arc(avatarX, avatarY, avatarRadius + 34, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.arc(avatarX, avatarY, avatarRadius + 16, 0, Math.PI * 2);
  ctx.fill();

  ctx.save();
  ctx.beginPath();
  ctx.arc(avatarX, avatarY, avatarRadius, 0, Math.PI * 2);
  ctx.closePath();
  ctx.clip();
  if (opts.photoUrl) {
    try {
      const image = await loadImage(opts.photoUrl);
      const scale = Math.max((avatarRadius * 2) / image.width, (avatarRadius * 2) / image.height);
      const drawWidth = image.width * scale;
      const drawHeight = image.height * scale;
      ctx.drawImage(image, avatarX - drawWidth / 2, avatarY - drawHeight / 2, drawWidth, drawHeight);
    } catch {
      drawInitialsFallback(ctx, opts.participantName, avatarX, avatarY, avatarRadius);
    }
  } else {
    drawInitialsFallback(ctx, opts.participantName, avatarX, avatarY, avatarRadius);
  }
  ctx.restore();

  ctx.strokeStyle = "#FAA61A";
  ctx.lineWidth = 10;
  ctx.beginPath();
  ctx.arc(avatarX, avatarY, avatarRadius + 26, 0, Math.PI * 2);
  ctx.stroke();

  ctx.textAlign = "center";
  ctx.fillStyle = "#a7f3c2";
  ctx.font = "900 33px Manrope, Arial, sans-serif";
  ctx.fillText("I AM ATTENDING", SIZE / 2, 848);

  const nameSize = fitFontSize(ctx, opts.participantName, 830, 56, 34);
  ctx.font = `900 ${nameSize}px Manrope, Arial, sans-serif`;
  ctx.fillStyle = "#ffffff";
  ctx.fillText(opts.participantName, SIZE / 2, 912);

  ctx.font = "700 27px 'DM Sans', Arial, sans-serif";
  ctx.fillStyle = "#e7fff0";
  const titleLines = wrapText(ctx, opts.programTitle, 820);
  let textY = 958;
  for (const line of titleLines.slice(0, 2)) {
    ctx.fillText(line, SIZE / 2, textY);
    textY += 34;
  }

  if (opts.dateLabel) {
    ctx.font = "700 21px 'DM Sans', Arial, sans-serif";
    ctx.fillStyle = "rgba(255,255,255,0.86)";
    ctx.fillText(opts.dateLabel, SIZE / 2, Math.min(textY + 6, 1012));
  }

  ctx.restore();
  return canvas;
}

async function renderClassicCard(ctx: CanvasRenderingContext2D, opts: ComposeOptions) {
  const gradient = ctx.createLinearGradient(0, 0, SIZE, SIZE);
  gradient.addColorStop(0, "#4267b2");
  gradient.addColorStop(1, "#159568");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, SIZE, SIZE);

  ctx.strokeStyle = "rgba(255,255,255,0.10)";
  ctx.lineWidth = 70;
  ctx.beginPath();
  ctx.arc(SIZE - 60, 70, 230, 0, Math.PI * 2);
  ctx.stroke();

  ctx.fillStyle = "rgba(255,255,255,0.92)";
  ctx.textAlign = "left";
  ctx.font = "800 30px Manrope, Arial, sans-serif";
  ctx.fillText("DIGITAL DREAMS", 70, 80);
  ctx.fillStyle = "rgba(255,255,255,0.65)";
  ctx.font = "700 18px 'DM Sans', Arial, sans-serif";
  ctx.fillText("PROGRAM ATTENDANCE", 70, 110);

  const avatarRadius = 200;
  const avatarY = 360;
  await drawPhotoCircle(ctx, opts, SIZE / 2, avatarY, avatarRadius, "#dbeafe", "#4267b2");

  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 16;
  ctx.beginPath();
  ctx.arc(SIZE / 2, avatarY, avatarRadius, 0, Math.PI * 2);
  ctx.stroke();
  ctx.strokeStyle = "#FAA61A";
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.arc(SIZE / 2, avatarY, avatarRadius + 14, 0, Math.PI * 2);
  ctx.stroke();

  ctx.textAlign = "center";
  ctx.fillStyle = "#ffffff";
  ctx.font = "800 58px Manrope, Arial, sans-serif";
  const lines = wrapText(ctx, opts.attendanceText.toUpperCase(), SIZE - 160);
  let textY = 700;
  for (const line of lines.slice(0, 4)) {
    ctx.fillText(line, SIZE / 2, textY);
    textY += 70;
  }

  ctx.fillStyle = "#bfdbfe";
  ctx.font = "700 30px 'DM Sans', Arial, sans-serif";
  for (const line of wrapText(ctx, opts.programTitle, SIZE - 200).slice(0, 2)) {
    ctx.fillText(line, SIZE / 2, textY + 10);
    textY += 40;
  }

  if (opts.dateLabel) {
    ctx.font = "700 26px 'DM Sans', Arial, sans-serif";
    const pillWidth = ctx.measureText(opts.dateLabel).width + 70;
    const pillX = SIZE / 2 - pillWidth / 2;
    const pillY = SIZE - 90;
    ctx.fillStyle = "rgba(255,255,255,0.16)";
    roundRect(ctx, pillX, pillY, pillWidth, 54, 27);
    ctx.fill();
    ctx.fillStyle = "#facc15";
    ctx.fillText(opts.dateLabel, SIZE / 2, pillY + 36);
  }
}

async function renderMinimalCard(ctx: CanvasRenderingContext2D, opts: ComposeOptions) {
  ctx.fillStyle = "#f8fbf7";
  ctx.fillRect(0, 0, SIZE, SIZE);

  ctx.fillStyle = "#ffffff";
  roundRect(ctx, 66, 66, SIZE - 132, SIZE - 132, 54);
  ctx.fill();
  ctx.strokeStyle = "#d9eadf";
  ctx.lineWidth = 3;
  ctx.stroke();

  ctx.fillStyle = "#071b33";
  ctx.textAlign = "left";
  ctx.font = "900 34px Manrope, Arial, sans-serif";
  ctx.fillText("DIGITAL DREAMS", 112, 142);
  ctx.fillStyle = "#159568";
  ctx.font = "800 18px 'DM Sans', Arial, sans-serif";
  ctx.fillText("PROGRAM ATTENDANCE", 112, 174);

  await drawPhotoCircle(ctx, opts, SIZE / 2, 408, 190, "#e8fff0", "#159568");
  ctx.strokeStyle = "#159568";
  ctx.lineWidth = 7;
  ctx.beginPath();
  ctx.arc(SIZE / 2, 408, 205, 0, Math.PI * 2);
  ctx.stroke();

  ctx.textAlign = "center";
  ctx.fillStyle = "#159568";
  ctx.font = "900 29px Manrope, Arial, sans-serif";
  ctx.fillText("I AM ATTENDING", SIZE / 2, 682);

  const nameSize = fitFontSize(ctx, opts.participantName, 760, 62, 36);
  ctx.fillStyle = "#071b33";
  ctx.font = `900 ${nameSize}px Manrope, Arial, sans-serif`;
  ctx.fillText(opts.participantName, SIZE / 2, 758);

  ctx.fillStyle = "#475569";
  ctx.font = "700 30px 'DM Sans', Arial, sans-serif";
  let textY = 818;
  for (const line of wrapText(ctx, opts.programTitle, 780).slice(0, 2)) {
    ctx.fillText(line, SIZE / 2, textY);
    textY += 40;
  }

  if (opts.dateLabel) {
    ctx.fillStyle = "#eefaf3";
    const pillWidth = 360;
    roundRect(ctx, SIZE / 2 - pillWidth / 2, 930, pillWidth, 58, 29);
    ctx.fill();
    ctx.fillStyle = "#128d55";
    ctx.font = "800 22px 'DM Sans', Arial, sans-serif";
    ctx.fillText(opts.dateLabel, SIZE / 2, 967);
  }
}

async function drawPhotoCircle(
  ctx: CanvasRenderingContext2D,
  opts: ComposeOptions,
  x: number,
  y: number,
  radius: number,
  fallbackFrom: string,
  fallbackText: string,
) {
  ctx.save();
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.closePath();
  ctx.clip();
  if (opts.photoUrl) {
    try {
      const image = await loadImage(opts.photoUrl);
      const scale = Math.max((radius * 2) / image.width, (radius * 2) / image.height);
      const drawWidth = image.width * scale;
      const drawHeight = image.height * scale;
      ctx.drawImage(image, x - drawWidth / 2, y - drawHeight / 2, drawWidth, drawHeight);
    } catch {
      drawFlatInitialsFallback(ctx, opts.participantName, x, y, radius, fallbackFrom, fallbackText);
    }
  } else {
    drawFlatInitialsFallback(ctx, opts.participantName, x, y, radius, fallbackFrom, fallbackText);
  }
  ctx.restore();
}

function drawFlatInitialsFallback(
  ctx: CanvasRenderingContext2D,
  name: string,
  x: number,
  y: number,
  radius: number,
  background: string,
  textColor: string,
) {
  ctx.fillStyle = background;
  ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
  ctx.fillStyle = textColor;
  ctx.textAlign = "center";
  ctx.font = "900 150px Manrope, Arial, sans-serif";
  ctx.fillText(initials(name), x, y + 52);
}

function drawInitialsFallback(ctx: CanvasRenderingContext2D, name: string, x: number, y: number, radius: number) {
  const gradient = ctx.createLinearGradient(x - radius, y - radius, x + radius, y + radius);
  gradient.addColorStop(0, "#e8fff0");
  gradient.addColorStop(1, "#c8f7db");
  ctx.fillStyle = gradient;
  ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
  ctx.fillStyle = "#159568";
  ctx.textAlign = "center";
  ctx.font = "900 150px Manrope, Arial, sans-serif";
  ctx.fillText(initials(name), x, y + 54);
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

export function canvasToPngDataUrl(canvas: HTMLCanvasElement): string {
  return canvas.toDataURL("image/png");
}

export function canvasToPngBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("Could not create image."))), "image/png");
  });
}

export function canvasToPdfBlob(canvas: HTMLCanvasElement): Blob {
  const pdf = new jsPDF({ orientation: "portrait", unit: "pt", format: [canvas.width, canvas.height], compress: true });
  pdf.addImage(canvas.toDataURL("image/png"), "PNG", 0, 0, canvas.width, canvas.height, undefined, "FAST");
  return pdf.output("blob");
}
