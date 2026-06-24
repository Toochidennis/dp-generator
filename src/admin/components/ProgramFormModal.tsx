import { useState } from "react";
import { ImagePlus, LoaderCircle } from "lucide-react";
import type { CreateProgramPayload, Program, ProgramStatus } from "@/shared/types/domain";
import { programService } from "@/shared/services/programService";
import { readFileAsDataUrl, validateImageFile } from "@/shared/utils/fileHelpers";
import { slugify } from "@/shared/utils/format";
import { Modal } from "@/shared/components/ui/Modal";
import { Button, Field } from "@/shared/components/ui/primitives";

type Props = { open: boolean; onClose: () => void; program?: Program; onSaved: (program: Program) => void };

const STATUSES: ProgramStatus[] = ["draft", "active", "archived"];

export function ProgramFormModal({ open, onClose, program, onSaved }: Props) {
  const isEdit = Boolean(program);
  const [form, setForm] = useState<CreateProgramPayload & { defaultTemplateId?: string }>(() => ({
    title: program?.title ?? "",
    slug: program?.slug ?? "",
    description: program?.description ?? "",
    startDate: program?.startDate ?? "",
    endDate: program?.endDate ?? "",
    status: program?.status ?? "draft",
    attendanceText: program?.attendanceText ?? "{{name}} is attending {{programName}}",
    bannerUrl: program?.bannerUrl,
    defaultTemplateId: program?.templates.find((t) => t.isDefault)?.id,
  }));
  const [slugTouched, setSlugTouched] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string>();

  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) => setForm((prev) => ({ ...prev, [key]: value }));

  const onTitle = (value: string) => {
    set("title", value);
    if (!slugTouched) set("slug", slugify(value));
  };

  const onBanner = async (file?: File) => {
    if (!file) return;
    try {
      validateImageFile(file);
      set("bannerUrl", await readFileAsDataUrl(file));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not read banner.");
    }
  };

  const submit = async () => {
    if (!form.title.trim() || !form.slug.trim()) {
      setError("Title and slug are required.");
      return;
    }
    setSaving(true);
    setError(undefined);
    try {
      const saved = isEdit && program ? await programService.updateProgram(program.id, form) : await programService.createProgram(form);
      onSaved(saved);
      onClose();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not save program.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? "Edit program" : "Create program"} description="Programs power public attendance links." size="lg">
      <div className="space-y-4">
        <Field label="Program name">
          <input value={form.title} onChange={(e) => onTitle(e.target.value)} placeholder="e.g. Digital Dreams Tech Bootcamp 2026" className="text-input" />
        </Field>

        <Field label="Public slug" hint="used in the program link">
          <input
            value={form.slug}
            onChange={(e) => {
              setSlugTouched(true);
              set("slug", slugify(e.target.value));
            }}
            placeholder="digital-dreams-tech-bootcamp-2026"
            className="text-input font-mono text-xs"
          />
        </Field>

        <Field label="Description">
          <textarea value={form.description} onChange={(e) => set("description", e.target.value)} rows={3} placeholder="What is this program about?" className="text-input resize-none" />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Start date">
            <input type="date" value={form.startDate} onChange={(e) => set("startDate", e.target.value)} className="text-input" />
          </Field>
          <Field label="End date">
            <input type="date" value={form.endDate} onChange={(e) => set("endDate", e.target.value)} className="text-input" />
          </Field>
        </div>

        <Field label="Status">
          <div className="flex gap-2">
            {STATUSES.map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => set("status", status)}
                className={`flex-1 rounded-xl border px-3 py-2.5 text-xs font-bold capitalize transition ${form.status === status ? "border-[#4267b2] bg-blue-50 text-[#4267b2]" : "border-slate-200 bg-white text-slate-500 hover:border-slate-300"}`}
              >
                {status}
              </button>
            ))}
          </div>
        </Field>

        <Field label="Attendance wording" hint="use {{name}} and {{programName}}">
          <input value={form.attendanceText} onChange={(e) => set("attendanceText", e.target.value)} className="text-input" />
        </Field>

        <Field label="Banner image">
          <div className="flex items-center gap-3">
            <div className="h-16 w-28 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
              {form.bannerUrl ? <img src={form.bannerUrl} alt="Banner" className="h-full w-full object-cover" /> : <div className="grid h-full place-items-center text-slate-300"><ImagePlus size={18} /></div>}
            </div>
            <label className="cursor-pointer rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-600 hover:border-[#4267b2] hover:text-[#4267b2]">
              {form.bannerUrl ? "Replace banner" : "Upload banner"}
              <input type="file" accept="image/*" className="sr-only" onChange={(e) => void onBanner(e.target.files?.[0])} />
            </label>
          </div>
        </Field>

        {isEdit && program && program.templates.length > 0 && (
          <Field label="Default template">
            <select value={form.defaultTemplateId ?? ""} onChange={(e) => set("defaultTemplateId", e.target.value)} className="text-input">
              {program.templates.map((template) => (
                <option key={template.id} value={template.id}>{template.name}</option>
              ))}
            </select>
          </Field>
        )}

        {error && <p className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-600">{error}</p>}

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button onClick={() => void submit()} disabled={saving}>
            {saving ? <LoaderCircle size={15} className="animate-spin" /> : null}
            {isEdit ? "Save changes" : "Create program"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
