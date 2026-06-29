import { useEffect, useRef, useState } from "react";
import {
  type CertificateInput,
  downloadPdf,
  downloadPng,
  drawCertificate,
  ensureCertificateAssets,
  shareCertificateImage,
} from "@/public/certificate/renderCertificate";
import { celebrate } from "@/public/badge/confetti";

export type Step = "input" | "result";

const TOAST_MS = 2600;
const CELEBRATE_DELAY_MS = 140;
const MAX_NAME_LEN = 40;

/**
 * Owns the certificate generator's state and side effects (asset loading, canvas
 * draw, confetti, scroll) plus the form / export / share handlers. The page and
 * its steps stay presentational and read from this hook. Mirrors useBadgeStudio,
 * minus the photo — a certificate only needs the recipient's name.
 */
export function useCertificateStudio() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [step, setStep] = useState<Step>("input");
  const [name, setName] = useState("");
  const [assetsReady, setAssetsReady] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");

  // Load the template + name font once so the canvas renders correctly at step 2.
  useEffect(() => {
    let alive = true;
    ensureCertificateAssets().finally(() => alive && setAssetsReady(true));
    return () => {
      alive = false;
    };
  }, []);

  // Draw whenever the certificate is on screen or its inputs change.
  useEffect(() => {
    if (step !== "result" || !canvasRef.current) return;
    drawCertificate(canvasRef.current, { name } satisfies CertificateInput);
  }, [step, name, assetsReady]);

  // Celebrate once each time we reach the result step.
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

  const canGenerate = name.trim().length > 0;
  const firstName = name.trim().split(/\s+/)[0] || "Coder";

  function onGenerate() {
    if (!canGenerate) {
      setError("Add your name so we can put it on the certificate.");
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
    await downloadPdf(canvasRef.current, name);
    flashToast("Certificate PDF saved to your downloads.");
  }

  async function onShare() {
    if (!canvasRef.current) return;
    const result = await shareCertificateImage(canvasRef.current, name);
    if (result === "shared") {
      flashToast("Thanks for sharing! 🎓");
    } else if (result === "unsupported") {
      await downloadPng(canvasRef.current, name);
      flashToast("Your browser can't share files — certificate image saved instead.");
    }
    // "cancelled" → nothing to do.
  }

  return {
    refs: { canvasRef },
    // state
    step,
    name,
    assetsReady,
    error,
    toast,
    // derived
    canGenerate,
    firstName,
    maxNameLen: MAX_NAME_LEN,
    // handlers
    setName,
    onGenerate,
    onEdit,
    onDownload,
    onShare,
  };
}

export type CertificateStudio = ReturnType<typeof useCertificateStudio>;
