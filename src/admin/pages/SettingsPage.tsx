import { Database, Globe, Info } from "lucide-react";
import { API_BASE_URL, USE_MOCKS } from "@/shared/services/config";
import { PageHeader } from "@/shared/components/ui/primitives";

export function SettingsPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Settings" subtitle="Platform configuration for the Attendance Generator." />

      <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-2">
          <Database size={16} className="text-[#4267b2]" />
          <h2 className="text-sm font-extrabold text-slate-900">Data source</h2>
        </div>
        <p className="mt-2 text-sm text-slate-500">
          The admin and public experiences talk to the backend through a single API service layer.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <Row label="Mode" value={USE_MOCKS ? "Mock data (in-memory)" : "Live API"} tone={USE_MOCKS ? "amber" : "emerald"} />
          <Row label="API base URL" value={API_BASE_URL || "same origin"} />
        </div>
        <p className="mt-3 flex items-start gap-2 rounded-xl bg-slate-50 p-3 text-xs leading-5 text-slate-500">
          <Info size={14} className="mt-0.5 shrink-0 text-slate-400" />
          Set <code className="rounded bg-slate-200 px-1 font-mono text-[11px]">VITE_USE_MOCKS=false</code> and
          <code className="ml-1 rounded bg-slate-200 px-1 font-mono text-[11px]">VITE_API_BASE_URL</code> in your environment to switch to the real backend. No code changes are required.
        </p>
      </section>

      <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-2">
          <Globe size={16} className="text-[#159568]" />
          <h2 className="text-sm font-extrabold text-slate-900">Public links</h2>
        </div>
        <p className="mt-2 text-sm text-slate-500">
          Each program is published at <code className="rounded bg-slate-100 px-1 font-mono text-[12px]">/programs/&lt;slug&gt;/attending</code>.
          Generated cards are shareable at <code className="rounded bg-slate-100 px-1 font-mono text-[12px]">/share/&lt;id&gt;</code>.
        </p>
      </section>
    </div>
  );
}

function Row({ label, value, tone }: { label: string; value: string; tone?: "amber" | "emerald" }) {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
      <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">{label}</p>
      <p className={`mt-0.5 text-sm font-bold ${tone === "amber" ? "text-amber-600" : tone === "emerald" ? "text-emerald-600" : "text-slate-700"}`}>{value}</p>
    </div>
  );
}
