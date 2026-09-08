import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { LayoutTemplate, Plus, Star } from "lucide-react";
import type { ProgramTemplate } from "@/shared/types/domain";
import { programService } from "@/shared/services/programService";
import { templateService } from "@/shared/services/templateService";
import { useAsyncData } from "@/shared/hooks/useAsyncData";
import { PageHeader, Button } from "@/shared/components/ui/primitives";
import { StatusBadge } from "@/shared/components/ui/StatusBadge";
import { EmptyState, ErrorState, LoadingState } from "@/shared/components/ui/states";
import { TemplateFormModal } from "@/admin/components/TemplateFormModal";

export function TemplatesPage() {
  const programsQuery = useAsyncData((signal) => programService.getPrograms(signal), []);
  const templatesQuery = useAsyncData((signal) => templateService.getTemplates(signal), []);
  const [adding, setAdding] = useState(false);
  const [filter, setFilter] = useState("all");
  const [assigning, setAssigning] = useState<Record<string, boolean>>({});

  const programs = useMemo(() => programsQuery.data ?? [], [programsQuery.data]);
  const programName = (id: string | null) => (id ? programs.find((p) => p.id === id)?.title ?? "—" : undefined);

  const templates = (templatesQuery.data ?? []).filter((t) => {
    if (filter === "all") return true;
    if (filter === "unassigned") return !t.programId;
    return t.programId === filter;
  });

  const makeDefault = async (template: ProgramTemplate) => {
    if (!template.programId) return;
    await templateService.setDefaultTemplate(template.programId, template.id);
    templatesQuery.reload();
  };

  const assign = async (template: ProgramTemplate, programId: string) => {
    if (!programId) return;
    setAssigning((prev) => ({ ...prev, [template.id]: true }));
    try {
      await templateService.assignTemplate(template.id, programId);
      templatesQuery.reload();
    } finally {
      setAssigning((prev) => ({ ...prev, [template.id]: false }));
    }
  };

  const onAdded = () => templatesQuery.reload();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Templates"
        subtitle="Designs available across your programs. Upload one anytime, attach it to a program whenever you're ready."
        actions={<Button onClick={() => setAdding(true)}><Plus size={15} /> Upload template</Button>}
      />

      <div className="flex items-center gap-2">
        <span className="text-xs font-bold text-slate-400">Filter:</span>
        <select value={filter} onChange={(e) => setFilter(e.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-600">
          <option value="all">All templates</option>
          <option value="unassigned">Unassigned</option>
          {programs.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}
        </select>
      </div>

      {templatesQuery.status === "loading" ? (
        <LoadingState label="Loading templates…" />
      ) : templatesQuery.status === "error" ? (
        <ErrorState message={templatesQuery.error} onRetry={templatesQuery.reload} />
      ) : templates.length === 0 ? (
        <EmptyState icon={<LayoutTemplate size={22} />} title="No templates" description="Upload a template to get started. You can attach it to a program now or later." action={<Button onClick={() => setAdding(true)}><Plus size={15} /> Upload template</Button>} />
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {templates.map((template) => (
            <div key={template.id} className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
              <div className="relative aspect-square bg-slate-100">
                {template.previewUrl && <img src={template.previewUrl} alt={template.name} className="h-full w-full object-cover" />}
                {template.isDefault && <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-amber-400 px-2 py-0.5 text-[9px] font-extrabold uppercase text-white"><Star size={10} /> Default</span>}
              </div>
              <div className="p-3">
                <p className="truncate text-sm font-bold text-slate-800">{template.name}</p>
                {template.programId ? (
                  <Link to={`/admin/programs/${template.programId}?tab=templates`} className="block truncate text-[11px] font-semibold text-[#1b3a9e] hover:underline">{programName(template.programId)}</Link>
                ) : (
                  <span className="block truncate text-[11px] font-semibold uppercase tracking-wide text-slate-400">Unassigned</span>
                )}
                <div className="mt-1.5 flex items-center gap-2 text-[10px] font-semibold uppercase text-slate-400">
                  <StatusBadge status={template.status} />
                  <span>{template.type}</span>
                </div>
                {!template.isDefault && template.status === "active" && template.programId && (
                  <button type="button" onClick={() => void makeDefault(template)} className="mt-2 w-full rounded-lg border border-slate-200 px-2 py-1.5 text-[11px] font-bold text-slate-500 hover:border-amber-300 hover:text-amber-600">Make default</button>
                )}
                {!template.programId && programs.length > 0 && (
                  <select
                    defaultValue=""
                    disabled={assigning[template.id]}
                    onChange={(e) => void assign(template, e.target.value)}
                    className="mt-2 w-full rounded-lg border border-slate-200 px-2 py-1.5 text-[11px] font-bold text-slate-500 disabled:opacity-50"
                  >
                    <option value="" disabled>Attach to program…</option>
                    {programs.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}
                  </select>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {adding && <TemplateFormModal open programs={programs} onClose={() => setAdding(false)} onSaved={onAdded} />}
    </div>
  );
}
