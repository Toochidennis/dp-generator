import { useState } from "react";
import { Download, Eye, FileImage } from "lucide-react";
import type { Generation } from "@/shared/types/domain";
import { formatDateTime } from "@/shared/utils/format";
import { Modal } from "@/shared/components/ui/Modal";

type Props = { generations: Generation[]; showProgram?: boolean };

const available = (url?: string) => Boolean(url) && url !== "#";

export function GenerationsTable({ generations, showProgram = true }: Props) {
  const [details, setDetails] = useState<Generation>();

  return (
    <>
      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[680px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-[10px] font-extrabold uppercase tracking-wide text-slate-400">
                <th className="px-4 py-3">Participant</th>
                {showProgram && <th className="px-4 py-3">Program</th>}
                <th className="px-4 py-3">Template</th>
                <th className="px-4 py-3">Generated</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {generations.map((gen) => (
                <tr key={gen.id} className="hover:bg-slate-50/60">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <span className="grid size-8 shrink-0 place-items-center rounded-full bg-blue-50 text-[11px] font-extrabold text-[#4267b2]">{gen.participantName.slice(0, 1).toUpperCase()}</span>
                      <span className="font-bold text-slate-800">{gen.participantName}</span>
                    </div>
                  </td>
                  {showProgram && <td className="px-4 py-3 text-xs text-slate-500">{gen.programTitle}</td>}
                  <td className="px-4 py-3 text-xs text-slate-500">{gen.templateName ?? "—"}</td>
                  <td className="px-4 py-3 text-xs text-slate-500">{formatDateTime(gen.generatedAt)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <a aria-disabled={!available(gen.pdfUrl)} href={available(gen.pdfUrl) ? gen.pdfUrl : undefined} target="_blank" rel="noreferrer" title="Download PDF" className={`grid size-8 place-items-center rounded-lg ${available(gen.pdfUrl) ? "text-slate-400 hover:bg-slate-100 hover:text-[#4267b2]" : "cursor-not-allowed text-slate-200"}`}><Download size={15} /></a>
                      <a aria-disabled={!available(gen.imageUrl)} href={available(gen.imageUrl) ? gen.imageUrl : undefined} target="_blank" rel="noreferrer" title="Download image" className={`grid size-8 place-items-center rounded-lg ${available(gen.imageUrl) ? "text-slate-400 hover:bg-slate-100 hover:text-[#4267b2]" : "cursor-not-allowed text-slate-200"}`}><FileImage size={15} /></a>
                      <button type="button" title="View details" onClick={() => setDetails(gen)} className="grid size-8 place-items-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-[#4267b2]"><Eye size={15} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={Boolean(details)} onClose={() => setDetails(undefined)} title="Generation details">
        {details && (
          <div className="space-y-4">
            {available(details.imageUrl) && (
              <div className="overflow-hidden rounded-2xl border border-slate-100 bg-slate-50">
                <img src={details.imageUrl} alt={`${details.participantName} card`} className="block w-full" />
              </div>
            )}
            <dl className="grid grid-cols-2 gap-3 text-sm">
              <Detail label="Participant" value={details.participantName} />
              <Detail label="Program" value={details.programTitle ?? "—"} />
              <Detail label="Template" value={details.templateName ?? "—"} />
              <Detail label="Generated" value={formatDateTime(details.generatedAt)} />
              {details.expiresAt && <Detail label="Expires" value={formatDateTime(details.expiresAt)} />}
              <Detail label="ID" value={details.id} mono />
            </dl>
          </div>
        )}
      </Modal>
    </>
  );
}

function Detail({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="rounded-xl bg-slate-50 p-3">
      <dt className="text-[10px] font-bold uppercase tracking-wide text-slate-400">{label}</dt>
      <dd className={`mt-0.5 truncate text-sm font-semibold text-slate-700 ${mono ? "font-mono text-xs" : ""}`}>{value}</dd>
    </div>
  );
}
