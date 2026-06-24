import { useState } from "react";
import { Link } from "react-router-dom";
import { Archive, CalendarRange, Eye, Pencil, Plus } from "lucide-react";
import type { Program } from "@/shared/types/domain";
import { programService } from "@/shared/services/programService";
import { useAsyncData } from "@/shared/hooks/useAsyncData";
import { formatDateRange } from "@/shared/utils/format";
import { publicProgramUrl } from "@/shared/utils/links";
import { PageHeader, Button } from "@/shared/components/ui/primitives";
import { StatusBadge } from "@/shared/components/ui/StatusBadge";
import { CopyButton } from "@/shared/components/ui/CopyButton";
import { EmptyState, ErrorState, LoadingState } from "@/shared/components/ui/states";
import { ProgramFormModal } from "@/admin/components/ProgramFormModal";

export function ProgramsPage() {
  const { data, status, error, reload, setData } = useAsyncData((signal) => programService.getPrograms(signal), []);
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<Program>();
  const programs = data ?? [];

  const archive = async (program: Program) => {
    if (!window.confirm(`Archive "${program.title}"? Its public link will stop working.`)) return;
    const updated = await programService.archiveProgram(program.id);
    setData((current) => (current ?? []).map((item) => (item.id === updated.id ? updated : item)));
  };

  const onSaved = (saved: Program) => {
    setData((current) => {
      const list = current ?? [];
      return list.some((item) => item.id === saved.id) ? list.map((item) => (item.id === saved.id ? saved : item)) : [saved, ...list];
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Programs"
        subtitle="Each program has its own public attendance link, templates, and generations."
        actions={<Button onClick={() => setCreating(true)}><Plus size={15} /> Create program</Button>}
      />

      {status === "loading" ? (
        <LoadingState label="Loading programs…" />
      ) : status === "error" ? (
        <ErrorState message={error} onRetry={reload} />
      ) : programs.length === 0 ? (
        <EmptyState
          icon={<CalendarRange size={22} />}
          title="No programs yet"
          description="Create your first attendance program to generate a public link."
          action={<Button onClick={() => setCreating(true)}><Plus size={15} /> Create program</Button>}
        />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-[10px] font-extrabold uppercase tracking-wide text-slate-400">
                  <th className="px-4 py-3">Program</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Public link</th>
                  <th className="px-4 py-3 text-center">Templates</th>
                  <th className="px-4 py-3 text-center">Participants</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {programs.map((program) => (
                  <tr key={program.id} className="hover:bg-slate-50/60">
                    <td className="px-4 py-3">
                      <Link to={`/admin/programs/${program.id}`} className="font-bold text-slate-800 hover:text-[#4267b2]">{program.title}</Link>
                      <p className="font-mono text-[10px] text-slate-400">/{program.slug}</p>
                    </td>
                    <td className="px-4 py-3"><StatusBadge status={program.status} /></td>
                    <td className="px-4 py-3 text-xs text-slate-500">{formatDateRange(program.startDate, program.endDate) || "—"}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1.5 text-[11px] font-bold ${program.status === "active" ? "text-emerald-600" : "text-slate-400"}`}>
                        <span className={`size-1.5 rounded-full ${program.status === "active" ? "bg-emerald-500" : "bg-slate-300"}`} />
                        {program.status === "active" ? "Live" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center text-xs font-bold text-slate-600">{program.templates.length}</td>
                    <td className="px-4 py-3 text-center text-xs font-bold text-slate-600">{program.generationCount ?? 0}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Link to={`/admin/programs/${program.id}`} title="View" className="grid size-8 place-items-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-[#4267b2]"><Eye size={15} /></Link>
                        <button type="button" title="Edit" onClick={() => setEditing(program)} className="grid size-8 place-items-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-[#4267b2]"><Pencil size={15} /></button>
                        <CopyButton value={publicProgramUrl(program.slug)} label="Link" className="!min-h-0 !py-1.5" />
                        {program.status !== "archived" && (
                          <button type="button" title="Archive" onClick={() => void archive(program)} className="grid size-8 place-items-center rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-500"><Archive size={15} /></button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {creating && <ProgramFormModal open onClose={() => setCreating(false)} onSaved={onSaved} />}
      {editing && <ProgramFormModal open program={editing} onClose={() => setEditing(undefined)} onSaved={onSaved} />}
    </div>
  );
}
