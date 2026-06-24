import { useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { ArrowLeft, CheckCircle2, ExternalLink, FileStack, LayoutTemplate, Pencil, Plus, Star } from "lucide-react";
import type { Program, ProgramTemplate } from "@/shared/types/domain";
import { programService } from "@/shared/services/programService";
import { generationService } from "@/shared/services/generationService";
import { templateService } from "@/shared/services/templateService";
import { useAsyncData } from "@/shared/hooks/useAsyncData";
import { formatDateRange } from "@/shared/utils/format";
import { publicProgramUrl } from "@/shared/utils/links";
import { PageHeader, StatCard, Button } from "@/shared/components/ui/primitives";
import { StatusBadge } from "@/shared/components/ui/StatusBadge";
import { CopyButton } from "@/shared/components/ui/CopyButton";
import { EmptyState, ErrorState, LoadingState } from "@/shared/components/ui/states";
import { ProgramFormModal } from "@/admin/components/ProgramFormModal";
import { TemplateFormModal } from "@/admin/components/TemplateFormModal";
import { GenerationsTable } from "@/admin/components/GenerationsTable";

const TABS = ["overview", "templates", "generations", "settings"] as const;
type Tab = (typeof TABS)[number];

export function ProgramDetailsPage() {
  const { id = "" } = useParams();
  const [params, setParams] = useSearchParams();
  const tab = (TABS.includes(params.get("tab") as Tab) ? params.get("tab") : "overview") as Tab;
  const setTab = (next: Tab) => setParams({ tab: next }, { replace: true });

  const program = useAsyncData((signal) => programService.getProgramById(id, signal), [id]);
  const generations = useAsyncData((signal) => generationService.getGenerationsByProgram(id, signal), [id]);

  if (program.status === "loading") return <LoadingState label="Loading program…" />;
  if (program.status === "error" || !program.data) return <ErrorState message={program.error} onRetry={program.reload} />;

  const data = program.data;
  const update = (updater: (current?: Program) => Program) => program.setData(updater);

  return (
    <div className="space-y-6">
      <Link to="/admin/programs" className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-[#4267b2]">
        <ArrowLeft size={14} /> All programs
      </Link>

      <PageHeader
        title={data.title}
        subtitle={`/${data.slug}`}
        actions={
          <>
            <StatusBadge status={data.status} />
            <a href={publicProgramUrl(data.slug)} target="_blank" rel="noreferrer" className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-600 hover:border-[#4267b2] hover:text-[#4267b2]">
              <ExternalLink size={14} /> Open link
            </a>
          </>
        }
      />

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto border-b border-slate-200">
        {TABS.map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => setTab(value)}
            className={`-mb-px shrink-0 border-b-2 px-4 py-2.5 text-sm font-bold capitalize transition ${tab === value ? "border-[#4267b2] text-[#4267b2]" : "border-transparent text-slate-400 hover:text-slate-600"}`}
          >
            {value}
          </button>
        ))}
      </div>

      {tab === "overview" && (
        <OverviewTab data={data} generationsCount={generations.data?.length} />
      )}
      {tab === "templates" && (
        <TemplatesTab
          program={data}
          onAdded={(template) => update((current) => ({ ...(current ?? data), templates: [...(current ?? data).templates, template] }))}
          onDefault={(templates) => update((current) => ({ ...(current ?? data), templates }))}
        />
      )}
      {tab === "generations" && (
        generations.status === "loading" ? <LoadingState /> :
        generations.status === "error" ? <ErrorState message={generations.error} onRetry={generations.reload} /> :
        (generations.data?.length ?? 0) === 0 ? <EmptyState icon={<FileStack size={22} />} title="No generations yet" description="Participant cards generated from this program's link will appear here." /> :
        <GenerationsTable generations={generations.data ?? []} showProgram={false} />
      )}
      {tab === "settings" && <SettingsTab program={data} onSaved={(saved) => update(() => saved)} />}
    </div>
  );
}

function OverviewTab({ data, generationsCount }: { data: Program; generationsCount?: number }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard icon={<CheckCircle2 size={18} />} label="Status" value={<span className="capitalize">{data.status}</span>} />
        <StatCard icon={<LayoutTemplate size={18} />} label="Templates" value={data.templates.length} accent="text-violet-600" />
        <StatCard icon={<FileStack size={18} />} label="Generations" value={data.generationCount ?? generationsCount ?? 0} accent="text-[#159568]" />
        <StatCard icon={<CheckCircle2 size={18} />} label="Active templates" value={data.templates.filter((t) => t.status === "active").length} accent="text-emerald-600" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.4fr_1fr]">
        <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-extrabold text-slate-900">About</h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">{data.description || "No description provided."}</p>
          <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <div><dt className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Date</dt><dd className="mt-0.5 font-semibold text-slate-700">{formatDateRange(data.startDate, data.endDate) || "—"}</dd></div>
            <div><dt className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Wording</dt><dd className="mt-0.5 font-semibold text-slate-700">{data.attendanceText}</dd></div>
          </dl>
        </section>

        <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-extrabold text-slate-900">Public link</h2>
          <p className="mt-2 break-all rounded-xl bg-slate-50 p-3 font-mono text-[11px] text-slate-500">{publicProgramUrl(data.slug)}</p>
          <div className="mt-3 flex gap-2">
            <CopyButton value={publicProgramUrl(data.slug)} label="Copy link" />
            <a href={publicProgramUrl(data.slug)} target="_blank" rel="noreferrer" className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-600 hover:border-[#4267b2] hover:text-[#4267b2]"><ExternalLink size={14} /> Open</a>
          </div>
        </section>
      </div>
    </div>
  );
}

function TemplatesTab({ program, onAdded, onDefault }: { program: Program; onAdded: (t: ProgramTemplate) => void; onDefault: (templates: ProgramTemplate[]) => void }) {
  const [adding, setAdding] = useState(false);

  const makeDefault = async (templateId: string) => {
    const templates = await templateService.setDefaultTemplate(program.id, templateId);
    onDefault(templates);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">{program.templates.length} template{program.templates.length === 1 ? "" : "s"} attached</p>
        <Button onClick={() => setAdding(true)}><Plus size={15} /> Upload template</Button>
      </div>

      {program.templates.length === 0 ? (
        <EmptyState icon={<LayoutTemplate size={22} />} title="No templates yet" description="Upload a template so participants can generate cards." action={<Button onClick={() => setAdding(true)}><Plus size={15} /> Upload template</Button>} />
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {program.templates.map((template) => (
            <div key={template.id} className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
              <div className="relative aspect-square bg-slate-100">
                {template.previewUrl && <img src={template.previewUrl} alt={template.name} className="h-full w-full object-cover" />}
                {template.isDefault && <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-amber-400 px-2 py-0.5 text-[9px] font-extrabold uppercase text-white"><Star size={10} /> Default</span>}
              </div>
              <div className="p-3">
                <p className="truncate text-sm font-bold text-slate-800">{template.name}</p>
                <div className="mt-1 flex items-center gap-2 text-[10px] font-semibold uppercase text-slate-400">
                  <StatusBadge status={template.status} />
                  <span>{template.type}</span>
                </div>
                {!template.isDefault && template.status === "active" && (
                  <button type="button" onClick={() => void makeDefault(template.id)} className="mt-2 w-full rounded-lg border border-slate-200 px-2 py-1.5 text-[11px] font-bold text-slate-500 hover:border-amber-300 hover:text-amber-600">
                    Make default
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {adding && <TemplateFormModal open programId={program.id} onClose={() => setAdding(false)} onSaved={onAdded} />}
    </div>
  );
}

function SettingsTab({ program, onSaved }: { program: Program; onSaved: (program: Program) => void }) {
  const [editing, setEditing] = useState(false);

  const archive = async () => {
    if (!window.confirm("Archive this program? Its public link will stop working.")) return;
    onSaved(await programService.archiveProgram(program.id));
  };

  return (
    <div className="space-y-4">
      <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-extrabold text-slate-900">Program settings</h2>
            <p className="mt-1 text-xs text-slate-500">Edit wording, dates, status, and banner.</p>
          </div>
          <Button variant="secondary" onClick={() => setEditing(true)}><Pencil size={14} /> Edit</Button>
        </div>
        <dl className="mt-4 grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
          <div className="rounded-xl bg-slate-50 p-3"><dt className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Attendance wording</dt><dd className="mt-0.5 font-semibold text-slate-700">{program.attendanceText}</dd></div>
          <div className="rounded-xl bg-slate-50 p-3"><dt className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Status</dt><dd className="mt-0.5 font-semibold capitalize text-slate-700">{program.status}</dd></div>
        </dl>
      </section>

      {program.status !== "archived" && (
        <section className="rounded-2xl border border-rose-200 bg-rose-50/40 p-5">
          <h2 className="text-sm font-extrabold text-rose-700">Danger zone</h2>
          <p className="mt-1 text-xs text-rose-600">Archiving disables the public attendance link.</p>
          <Button variant="danger" className="mt-3" onClick={() => void archive()}>Archive program</Button>
        </section>
      )}

      {editing && <ProgramFormModal open program={program} onClose={() => setEditing(false)} onSaved={onSaved} />}
    </div>
  );
}
