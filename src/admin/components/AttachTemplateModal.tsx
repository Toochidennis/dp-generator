import { useState } from "react";
import { LayoutTemplate, LoaderCircle } from "lucide-react";
import type { ProgramTemplate } from "@/shared/types/domain";
import { templateService } from "@/shared/services/templateService";
import { useAsyncData } from "@/shared/hooks/useAsyncData";
import { Modal } from "@/shared/components/ui/Modal";
import { Button } from "@/shared/components/ui/primitives";
import { EmptyState, ErrorState, LoadingState } from "@/shared/components/ui/states";

type Props = { open: boolean; onClose: () => void; programId: string; onAttached: (template: ProgramTemplate) => void };

export function AttachTemplateModal({ open, onClose, programId, onAttached }: Props) {
  const { data, status, error } = useAsyncData((signal) => templateService.getUnassignedTemplates(signal), []);
  const [attachingId, setAttachingId] = useState<string>();
  const [errorMessage, setErrorMessage] = useState<string>();
  const templates = data ?? [];

  const attach = async (template: ProgramTemplate) => {
    setAttachingId(template.id);
    setErrorMessage(undefined);
    try {
      const saved = await templateService.assignTemplate(template.id, programId);
      onAttached(saved);
      onClose();
    } catch (cause) {
      setErrorMessage(cause instanceof Error ? cause.message : "Could not attach that template.");
    } finally {
      setAttachingId(undefined);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Attach existing template" description="Pick a template that hasn't been assigned to a program yet.">
      <div className="space-y-4">
        {status === "loading" ? (
          <LoadingState label="Loading templates…" />
        ) : status === "error" ? (
          <ErrorState message={error} />
        ) : templates.length === 0 ? (
          <EmptyState icon={<LayoutTemplate size={22} />} title="Nothing to attach" description="Every uploaded template is already attached to a program. Upload a new one instead." />
        ) : (
          <div className="grid max-h-96 grid-cols-2 gap-3 overflow-y-auto sm:grid-cols-3">
            {templates.map((template) => (
              <div key={template.id} className="overflow-hidden rounded-xl border border-slate-200/80 bg-white">
                <div className="aspect-square bg-slate-100">
                  {template.previewUrl && <img src={template.previewUrl} alt={template.name} className="h-full w-full object-cover" />}
                </div>
                <div className="p-2.5">
                  <p className="truncate text-xs font-bold text-slate-800">{template.name}</p>
                  <Button variant="secondary" className="mt-2 w-full !py-1.5 text-[11px]" onClick={() => void attach(template)} disabled={attachingId === template.id}>
                    {attachingId === template.id ? <LoaderCircle size={13} className="animate-spin" /> : null} Attach
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {errorMessage && <p className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-600">{errorMessage}</p>}

        <div className="flex justify-end pt-2">
          <Button variant="secondary" onClick={onClose}>Close</Button>
        </div>
      </div>
    </Modal>
  );
}
