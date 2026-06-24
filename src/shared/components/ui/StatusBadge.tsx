import type { ProgramStatus, TemplateStatus } from "@/shared/types/domain";

const styles: Record<string, string> = {
  active: "border-emerald-200 bg-emerald-50 text-emerald-700",
  draft: "border-amber-200 bg-amber-50 text-amber-700",
  archived: "border-slate-200 bg-slate-100 text-slate-500",
};

const dot: Record<string, string> = {
  active: "bg-emerald-500",
  draft: "bg-amber-500",
  archived: "bg-slate-400",
};

export function StatusBadge({ status }: { status: ProgramStatus | TemplateStatus }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${styles[status] ?? styles.draft}`}>
      <span className={`size-1.5 rounded-full ${dot[status] ?? dot.draft}`} />
      {status}
    </span>
  );
}
