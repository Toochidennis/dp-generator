import { Link } from "react-router-dom";
import { ArrowRight, CalendarRange, CheckCircle2, FileStack, LayoutTemplate } from "lucide-react";
import { programService } from "@/shared/services/programService";
import { generationService } from "@/shared/services/generationService";
import { useAsyncData } from "@/shared/hooks/useAsyncData";
import { formatDateTime } from "@/shared/utils/format";
import { PageHeader, StatCard } from "@/shared/components/ui/primitives";
import { StatusBadge } from "@/shared/components/ui/StatusBadge";
import { EmptyState, ErrorState, LoadingState } from "@/shared/components/ui/states";

export function DashboardPage() {
  const programs = useAsyncData((signal) => programService.getPrograms(signal), []);
  const generations = useAsyncData((signal) => generationService.getGenerations(signal), []);

  const list = programs.data ?? [];
  const gens = generations.data ?? [];
  const activeCount = list.filter((p) => p.status === "active").length;
  const templateCount = list.reduce((sum, p) => sum + p.templates.length, 0);
  const totalGenerations = list.reduce((sum, p) => sum + (p.generationCount ?? 0), 0);

  return (
    <div className="space-y-6">
      <PageHeader title="Dashboard" subtitle="Overview of your attendance programs and participant activity." />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard icon={<CalendarRange size={18} />} label="Programs" value={list.length} />
        <StatCard icon={<CheckCircle2 size={18} />} label="Active" value={activeCount} accent="text-emerald-600" />
        <StatCard icon={<LayoutTemplate size={18} />} label="Templates" value={templateCount} accent="text-violet-600" />
        <StatCard icon={<FileStack size={18} />} label="Generations" value={totalGenerations} accent="text-[#159568]" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.1fr_1fr]">
        {/* Recent programs */}
        <section className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm sm:p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-extrabold text-slate-900">Recent programs</h2>
            <Link to="/admin/programs" className="inline-flex items-center gap-1 text-xs font-bold text-[#4267b2] hover:underline">
              View all <ArrowRight size={13} />
            </Link>
          </div>
          {programs.status === "loading" ? (
            <LoadingState />
          ) : programs.status === "error" ? (
            <ErrorState message={programs.error} onRetry={programs.reload} />
          ) : list.length === 0 ? (
            <EmptyState title="No programs yet" description="Create your first attendance program to get started." />
          ) : (
            <ul className="divide-y divide-slate-100">
              {list.slice(0, 5).map((program) => (
                <li key={program.id}>
                  <Link to={`/admin/programs/${program.id}`} className="flex items-center gap-3 py-3 transition hover:opacity-80">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold text-slate-800">{program.title}</p>
                      <p className="text-xs text-slate-400">{program.templates.length} templates · {program.generationCount ?? 0} generations</p>
                    </div>
                    <StatusBadge status={program.status} />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Recent generations */}
        <section className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm sm:p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-extrabold text-slate-900">Recent generations</h2>
            <Link to="/admin/generations" className="inline-flex items-center gap-1 text-xs font-bold text-[#4267b2] hover:underline">
              View all <ArrowRight size={13} />
            </Link>
          </div>
          {generations.status === "loading" ? (
            <LoadingState />
          ) : generations.status === "error" ? (
            <ErrorState message={generations.error} onRetry={generations.reload} />
          ) : gens.length === 0 ? (
            <EmptyState title="No generations yet" description="Participant cards will appear here." />
          ) : (
            <ul className="divide-y divide-slate-100">
              {gens.slice(0, 5).map((gen) => (
                <li key={gen.id} className="flex items-center gap-3 py-3">
                  <span className="grid size-9 shrink-0 place-items-center rounded-full bg-blue-50 text-xs font-extrabold text-[#4267b2]">
                    {gen.participantName.slice(0, 1).toUpperCase()}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-slate-800">{gen.participantName}</p>
                    <p className="truncate text-xs text-slate-400">{gen.programTitle}</p>
                  </div>
                  <span className="shrink-0 text-[10px] font-semibold text-slate-400">{formatDateTime(gen.generatedAt)}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
