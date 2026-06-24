import type { ReactNode } from "react";
import { AlertTriangle, Inbox, LoaderCircle, RefreshCw } from "lucide-react";

export function Spinner({ className = "size-5" }: { className?: string }) {
  return <LoaderCircle className={`animate-spin ${className}`} />;
}

export function LoadingState({ label = "Loading…", className = "" }: { label?: string; className?: string }) {
  return (
    <div className={`grid place-items-center gap-3 py-16 text-center ${className}`} role="status">
      <span className="grid size-12 place-items-center rounded-2xl border border-slate-200 bg-white text-[#4267b2] shadow-sm">
        <Spinner className="size-6" />
      </span>
      <p className="text-sm font-semibold text-slate-500">{label}</p>
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message?: string; onRetry?: () => void }) {
  return (
    <div className="grid place-items-center gap-3 py-16 text-center">
      <span className="grid size-12 place-items-center rounded-2xl bg-rose-50 text-rose-600">
        <AlertTriangle size={22} />
      </span>
      <div>
        <p className="text-sm font-bold text-slate-800">Something went wrong</p>
        <p className="mt-1 text-xs text-rose-600">{message || "Please try again."}</p>
      </div>
      {onRetry && (
        <button type="button" onClick={onRetry} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-600 hover:border-[#4267b2] hover:text-[#4267b2]">
          <RefreshCw size={14} /> Retry
        </button>
      )}
    </div>
  );
}

export function EmptyState({ icon, title, description, action }: { icon?: ReactNode; title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="grid place-items-center gap-3 rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 py-14 px-6 text-center">
      <span className="grid size-12 place-items-center rounded-2xl border border-slate-200 bg-white text-slate-400 shadow-sm">
        {icon ?? <Inbox size={22} />}
      </span>
      <div>
        <p className="text-sm font-bold text-slate-800">{title}</p>
        {description && <p className="mx-auto mt-1 max-w-sm text-xs leading-5 text-slate-500">{description}</p>}
      </div>
      {action}
    </div>
  );
}
