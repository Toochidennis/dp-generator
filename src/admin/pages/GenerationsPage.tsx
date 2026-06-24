import { useMemo, useState } from "react";
import { FileStack } from "lucide-react";
import { generationService } from "@/shared/services/generationService";
import { programService } from "@/shared/services/programService";
import { useAsyncData } from "@/shared/hooks/useAsyncData";
import { PageHeader } from "@/shared/components/ui/primitives";
import { EmptyState, ErrorState, LoadingState } from "@/shared/components/ui/states";
import { GenerationsTable } from "@/admin/components/GenerationsTable";

export function GenerationsPage() {
  const { data, status, error, reload } = useAsyncData((signal) => generationService.getGenerations(signal), []);
  const programs = useAsyncData((signal) => programService.getPrograms(signal), []);
  const [program, setProgram] = useState("all");
  const [search, setSearch] = useState("");

  const programList = programs.data ?? [];
  const generations = useMemo(() => {
    return (data ?? []).filter((gen) => {
      if (program !== "all" && gen.programId !== program) return false;
      if (search && !gen.participantName.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [data, program, search]);

  return (
    <div className="space-y-6">
      <PageHeader title="Generations" subtitle="Every participant-generated attendance card." />

      <div className="flex flex-wrap items-center gap-2">
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search participant…" className="text-input max-w-xs !py-2 text-xs" />
        <select value={program} onChange={(e) => setProgram(e.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-600">
          <option value="all">All programs</option>
          {programList.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}
        </select>
      </div>

      {status === "loading" ? (
        <LoadingState label="Loading generations…" />
      ) : status === "error" ? (
        <ErrorState message={error} onRetry={reload} />
      ) : generations.length === 0 ? (
        <EmptyState icon={<FileStack size={22} />} title="No generations found" description="Participant cards will appear here once people use the public links." />
      ) : (
        <GenerationsTable generations={generations} />
      )}
    </div>
  );
}
