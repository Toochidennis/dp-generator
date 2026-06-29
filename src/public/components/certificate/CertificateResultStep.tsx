import { Download, Loader2, PartyPopper, Share2, SquarePen } from "lucide-react";
import { type CertificateStudio } from "@/public/hooks/useCertificateStudio";
import { StepDots } from "@/public/components/badge/StepDots";

/** Download (image) + Share — shown both above and below the certificate. */
function CertificateActions({ studio }: { studio: CertificateStudio }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <button
        type="button"
        onClick={studio.onDownload}
        className="kc-btn justify-center bg-brand text-ink hover:bg-brand-dark"
      >
        <Download size={18} /> Download
      </button>
      <button
        type="button"
        onClick={studio.onShare}
        className="kc-btn justify-center border-white/0 bg-ink text-white hover:bg-ink/90"
      >
        <Share2 size={18} /> Share
      </button>
    </div>
  );
}

/** Step 2 — reveal the generated certificate with download and share actions. */
export function CertificateResultStep({ studio }: { studio: CertificateStudio }) {
  const { name, firstName, assetsReady } = studio;

  return (
    <div className="kc-step-in">
      <div className="text-center">
        <span className="inline-flex items-center gap-2 rounded-full border-2 border-pop-mint/30 bg-pop-mint/10 px-3.5 py-1.5">
          <PartyPopper size={15} className="text-pop-mint" />
          <span className="kc-eyebrow text-[0.66rem] text-pop-mint">Step 2 of 2 · Congratulations</span>
        </span>
        <h1 className="mt-5 font-display text-4xl font-extrabold leading-[1.02] text-ink sm:text-5xl">
          Well done, {firstName}!
        </h1>
        <p className="mx-auto mt-4 max-w-md text-lg leading-relaxed text-ink/70">
          Your certificate is ready. Download it or share the achievement.
        </p>
        <div className="mt-6 flex justify-center">
          <StepDots step="result" />
        </div>
      </div>

      {/* Actions — above the certificate */}
      <div className="mx-auto mt-8 max-w-xl">
        <CertificateActions studio={studio} />
      </div>

      {/* Certificate reveal (landscape) */}
      <div className="relative mt-6 flex justify-center">
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-1/2 h-64 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand/25 blur-3xl"
        />
        <canvas
          ref={studio.refs.canvasRef}
          role="img"
          aria-label={`Certificate of participation for ${name}`}
          style={{ width: "100%", maxWidth: 760, aspectRatio: "4000 / 2827" }}
          className="kc-badge-pop relative rounded-xl shadow-badge"
        />
      </div>

      {/* Actions — below the certificate */}
      <div className="mx-auto mt-8 max-w-xl">
        <CertificateActions studio={studio} />

        {!assetsReady && (
          <p className="mt-3 flex items-center justify-center gap-2 text-xs text-ink/45">
            <Loader2 size={13} className="animate-spin" /> Preparing your certificate…
          </p>
        )}

        {/* Quiet, tertiary escape hatch — secondary to Download/Share. */}
        <div className="mt-6 border-t-2 border-ink/5 pt-5 text-center">
          <button
            type="button"
            onClick={studio.onEdit}
            className="inline-flex items-center justify-center gap-1.5 text-sm font-medium text-ink/50 transition-colors hover:text-ink"
          >
            <SquarePen size={15} /> Edit name
          </button>
        </div>
      </div>
    </div>
  );
}
