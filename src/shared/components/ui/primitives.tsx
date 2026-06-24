import type { ReactNode } from "react";

export function PageHeader({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: ReactNode }) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="font-[Manrope] text-2xl font-extrabold tracking-[-.03em] text-slate-900">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

export function StatCard({ icon, label, value, accent = "text-[#4267b2]" }: { icon: ReactNode; label: string; value: ReactNode; accent?: string }) {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-bold uppercase tracking-wide text-slate-400">{label}</span>
        <span className={`grid size-9 place-items-center rounded-xl bg-slate-50 ${accent}`}>{icon}</span>
      </div>
      <p className="mt-3 font-[Manrope] text-2xl font-extrabold text-slate-900">{value}</p>
    </div>
  );
}

export function Field({ label, hint, error, children }: { label: string; hint?: string; error?: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">{label}</span>
        {hint && <span className="text-[10px] font-medium text-slate-400">{hint}</span>}
      </span>
      {children}
      {error && <span className="mt-1 block text-[11px] font-semibold text-rose-600">{error}</span>}
    </label>
  );
}

type ButtonProps = {
  children: ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
  variant?: "primary" | "secondary" | "ghost" | "danger";
  disabled?: boolean;
  className?: string;
};

const variants: Record<string, string> = {
  primary: "bg-[#4267b2] text-white shadow-md shadow-blue-100 hover:bg-[#34589f]",
  secondary: "border border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50",
  ghost: "text-slate-600 hover:bg-slate-100",
  danger: "border border-rose-200 bg-white text-rose-600 hover:bg-rose-50",
};

export function Button({ children, onClick, type = "button", variant = "primary", disabled, className = "" }: ButtonProps) {
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-xl px-4 text-xs font-bold transition disabled:cursor-not-allowed disabled:opacity-40 ${variants[variant]} ${className}`}>
      {children}
    </button>
  );
}
