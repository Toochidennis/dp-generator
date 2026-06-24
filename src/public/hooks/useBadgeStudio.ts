import { useEffect, useRef, useState } from "react";
import { type BadgeInput, downloadPng, drawBadge, ensureBadgeAssets } from "@/public/badge/renderBadge";
import { celebrate } from "@/public/badge/confetti";
import { shareBadgeImage } from "@/public/badge/share";

export type Step = "input" | "result";

export const MAX_PHOTO_MB = 6;
const TOAST_MS = 2600;
const CELEBRATE_DELAY_MS = 140;

/**
 * Owns the badge generator's state, side effects (font loading, canvas draw,
 * confetti, scroll) and all the form / export / share handlers. The page and
 * its step components stay purely presentational and read from this hook.
 */
export function useBadgeStudio() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState<Step>("input");
  const [name, setName] = useState("");
  const [photo, setPhoto] = useState<HTMLImageElement | null>(null);
  const [photoName, setPhotoName] = useState("");
  const [fontsReady, setFontsReady] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");

  // Load the template art + name font once so the canvas renders correctly the
  // moment we reach step 2.
  useEffect(() => {
    let alive = true;
    ensureBadgeAssets().finally(() => alive && setFontsReady(true));
    return () => {
      alive = false;
    };
  }, []);

  // Draw the badge whenever it's on screen (result step) or its inputs change.
  useEffect(() => {
    if (step !== "result" || !canvasRef.current) return;
    const input: BadgeInput = { name, photo };
    drawBadge(canvasRef.current, input);
  }, [step, name, photo, fontsReady]);

  // Celebrate once, each time we transition into the result step.
  useEffect(() => {
    if (step !== "result") return;
    const t = window.setTimeout(() => celebrate(), CELEBRATE_DELAY_MS);
    return () => window.clearTimeout(t);
  }, [step]);

  // Each step is its own screen — start it from the top.
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [step]);

  function flashToast(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(""), TOAST_MS);
  }

  function onPickPhoto(file: File | undefined) {
    setError("");
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("That file isn't an image. Try a JPG or PNG.");
      return;
    }
    if (file.size > MAX_PHOTO_MB * 1024 * 1024) {
      setError(`That photo is over ${MAX_PHOTO_MB}MB. Pick a smaller one.`);
      return;
    }
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      setPhoto(img);
      setPhotoName(file.name);
      URL.revokeObjectURL(url);
    };
    img.onerror = () => {
      setError("We couldn't read that image. Try another file.");
      URL.revokeObjectURL(url);
    };
    img.src = url;
  }

  function removePhoto() {
    setPhoto(null);
    setPhotoName("");
    if (fileRef.current) fileRef.current.value = "";
  }

  const canGenerate = name.trim().length > 0 && photo !== null;
  const firstName = name.trim().split(/\s+/)[0] || "Coder";

  function onGenerate() {
    if (!canGenerate) {
      setError(!name.trim() ? "Add a name so we can put it on the badge." : "Add a photo to finish your badge.");
      return;
    }
    setError("");
    setStep("result");
  }

  function onEdit() {
    setStep("input");
  }

  async function onDownload() {
    if (!canvasRef.current) return;
    await downloadPng(canvasRef.current, name);
    flashToast("Badge image saved to your downloads.");
  }

  async function onShare() {
    if (!canvasRef.current) return;
    const result = await shareBadgeImage(canvasRef.current, name);
    if (result === "shared") {
      flashToast("Thanks for sharing! 🚀");
    } else if (result === "unsupported") {
      // Desktop browsers often can't open a share sheet — save the image so the
      // user can attach it wherever they like.
      await downloadPng(canvasRef.current, name);
      flashToast("Your browser can't share files — badge image saved instead.");
    }
    // "cancelled" → the user dismissed the share sheet; nothing to do.
  }

  return {
    refs: { canvasRef, fileRef },
    // state
    step,
    name,
    photo,
    photoName,
    fontsReady,
    error,
    toast,
    // derived
    canGenerate,
    firstName,
    // handlers
    setName,
    onPickPhoto,
    removePhoto,
    onGenerate,
    onEdit,
    onDownload,
    onShare,
  };
}

export type BadgeStudio = ReturnType<typeof useBadgeStudio>;
