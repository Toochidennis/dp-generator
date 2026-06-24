import { useState } from "react";
import { ImagePlus, LoaderCircle } from "lucide-react";
import type { Program, ProgramTemplate, TemplateType } from "@/shared/types/domain";
import { templateService } from "@/shared/services/templateService";
import { readFileAsDataUrl, validateImageFile } from "@/shared/utils/fileHelpers";
import { Modal } from "@/shared/components/ui/Modal";
import { Button, Field } from "@/shared/components/ui/primitives";

type Props = {
  open: boolean;
  onClose: () => void;
  programId?: string;
  programs?: Program[];
  onSaved: (template: ProgramTemplate) => void;
};

export function TemplateFormModal({ open, onClose, programId, programs, onSaved }: Props) {
  const [selectedProgram, setSelectedProgram] = useState(programId ?? programs?.[0]?.id ?? "");
  const [name, setName] = useState("");
  const [type, setType] = useState<TemplateType>("image");
  const [previewUrl, setPreviewUrl] = useState<string>();
  const [makeDefault, setMakeDefault] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string>();

  const onPreview = async (file?: File) => {
    if (!file) return;
    try {
      validateImageFile(file);
      setPreviewUrl(await readFileAsDataUrl(file));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not read image.");
    }
  };

  const submit = async () => {
    if (!selectedProgram) {
      setError("Select a program for this template.");
      return;
    }
    if (!name.trim()) {
      setError("Template name is required.");
      return;
    }
    setSaving(true);
    setError(undefined);
    try {
      const template = await templateService.createTemplate({
        programId: selectedProgram,
        name: name.trim(),
        previewUrl: previewUrl ?? "",
        type,
        isDefault: makeDefault,
      });
      onSaved(template);
      onClose();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not create template.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Upload template" description="Templates define the look of generated cards.">
      <div className="space-y-4">
        {!programId && programs && (
          <Field label="Program">
            <select value={selectedProgram} onChange={(e) => setSelectedProgram(e.target.value)} className="text-input">
              <option value="" disabled>Select a program…</option>
              {programs.map((program) => (
                <option key={program.id} value={program.id}>{program.title}</option>
              ))}
            </select>
          </Field>
        )}

        <Field label="Template name">
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Default Attendance Card" className="text-input" />
        </Field>

        <Field label="Type">
          <div className="flex gap-2">
            {(["image", "pdf"] as TemplateType[]).map((value) => (
              <button key={value} type="button" onClick={() => setType(value)} className={`flex-1 rounded-xl border px-3 py-2.5 text-xs font-bold uppercase transition ${type === value ? "border-[#4267b2] bg-blue-50 text-[#4267b2]" : "border-slate-200 bg-white text-slate-500"}`}>
                {value}
              </button>
            ))}
          </div>
        </Field>
        <p className="rounded-xl bg-slate-50 px-3 py-2 text-[11px] font-medium text-slate-500">Every attendance card includes the participant's photo.</p>

        <Field label="Preview image" hint="optional — a placeholder is used if empty">
          <div className="flex items-center gap-3">
            <div className="size-20 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
              {previewUrl ? <img src={previewUrl} alt="Preview" className="h-full w-full object-cover" /> : <div className="grid h-full place-items-center text-slate-300"><ImagePlus size={18} /></div>}
            </div>
            <label className="cursor-pointer rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-600 hover:border-[#4267b2] hover:text-[#4267b2]">
              {previewUrl ? "Replace image" : "Upload image"}
              <input type="file" accept="image/*" className="sr-only" onChange={(e) => void onPreview(e.target.files?.[0])} />
            </label>
          </div>
        </Field>

        <label className="flex items-center gap-2 text-xs font-bold text-slate-600">
          <input type="checkbox" checked={makeDefault} onChange={(e) => setMakeDefault(e.target.checked)} className="size-4 rounded border-slate-300" />
          Set as the program's default template
        </label>

        {error && <p className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-600">{error}</p>}

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button onClick={() => void submit()} disabled={saving}>{saving ? <LoaderCircle size={15} className="animate-spin" /> : null} Add template</Button>
        </div>
      </div>
    </Modal>
  );
}
