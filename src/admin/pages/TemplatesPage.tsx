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

  const programs = useMemo(() => programsQuery.data ?? [], [programsQuery.data]);
  const programName = (id: string) => programs.find((p) => p.id === id)?.title ?? "—";

  const templates = (templatesQuery.data ?? []).filter((t) => filter === "all" || t.programId === filter);

  const makeDefault = async (template: ProgramTemplate) => {
    await templateService.setDefaultTemplate(template.programId, template.id);
    templatesQuery.reload();
  };

  const onAdded = () => templatesQuery.reload();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Templates"
        subtitle="Designs available across your programs."
        actions={<Button onClick={() => setAdding(true)} disabled={programs.length === 0}><Plus size={15} /> Upload template</Button>}
      />

      {programs.length > 0 && (
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-400">Filter:</span>
          <select value={filter} onChange={(e) => setFilter(e.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-600">
            <option value="all">All programs</option>
            {programs.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}
          </select>
        </div>
      )}

      {templatesQuery.status === "loading" ? (
        <LoadingState label="Loading templates…" />
      ) : templatesQuery.status === "error" ? (
        <ErrorState message={templatesQuery.error} onRetry={templatesQuery.reload} />
      ) : templates.length === 0 ? (
        <EmptyState icon={<LayoutTemplate size={22} />} title="No templates" description="Upload a template and attach it to a program." action={programs.length > 0 ? <Button onClick={() => setAdding(true)}><Plus size={15} /> Upload template</Button> : undefined} />
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
                <Link to={`/admin/programs/${template.programId}?tab=templates`} className="block truncate text-[11px] font-semibold text-[#4267b2] hover:underline">{programName(template.programId)}</Link>
                <div className="mt-1.5 flex items-center gap-2 text-[10px] font-semibold uppercase text-slate-400">
                  <StatusBadge status={template.status} />
                  <span>{template.type}</span>
                </div>
                {!template.isDefault && template.status === "active" && (
                  <button type="button" onClick={() => void makeDefault(template)} className="mt-2 w-full rounded-lg border border-slate-200 px-2 py-1.5 text-[11px] font-bold text-slate-500 hover:border-amber-300 hover:text-amber-600">Make default</button>
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
