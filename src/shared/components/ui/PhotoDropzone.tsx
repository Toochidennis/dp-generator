import { useRef, useState, type ChangeEvent, type DragEvent } from "react";
import { CheckCircle2, ImagePlus, LoaderCircle, RefreshCw, UploadCloud } from "lucide-react";

type Props = {
  fileName?: string;
  imageUrl?: string;
  isLoading?: boolean;
  onUpload: (file: File) => Promise<void> | void;
  onError: (message: string) => void;
};

export function PhotoDropzone({ fileName, imageUrl, isLoading, onUpload, onError }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const process = async (file?: File) => {
    if (!file) return;
    try {
      await onUpload(file);
    } catch (error) {
      onError(error instanceof Error ? error.message : "Upload failed.");
    }
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    void process(event.target.files?.[0]);
    event.target.value = "";
  };
  const handleDrop = (event: DragEvent) => {
    event.preventDefault();
    setIsDragging(false);
    void process(event.dataTransfer.files[0]);
  };

  return (
    <>
      <input ref={inputRef} type="file" accept="image/png,image/jpeg,image/webp" className="sr-only" onChange={handleChange} />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`group flex w-full items-center gap-3 rounded-2xl border border-dashed p-4 text-left transition active:scale-[.99] ${isDragging ? "border-[#159568] bg-emerald-50 ring-4 ring-emerald-100" : imageUrl ? "border-emerald-300 bg-emerald-50/50 hover:border-emerald-400" : "border-[#cbded3] bg-[#f8fbf7] hover:border-[#159568] hover:bg-emerald-50/50"}`}
      >
        <span className="relative grid size-14 shrink-0 place-items-center overflow-hidden rounded-2xl bg-white text-[#159568] shadow-sm ring-1 ring-slate-900/5">
          {isLoading ? (
            <LoaderCircle size={20} className="animate-spin" />
          ) : imageUrl ? (
            <>
              <img src={imageUrl} alt="Uploaded portrait" className="h-full w-full object-cover" />
              <span className="absolute inset-0 grid place-items-center bg-slate-950/45 text-white opacity-0 transition group-hover:opacity-100">
                <RefreshCw size={16} />
              </span>
            </>
          ) : (
            <UploadCloud size={20} />
          )}
        </span>
          <span className="min-w-0">
            <span className="block truncate text-sm font-bold text-slate-800">{fileName || "Upload or drop photo"}</span>
            <span className="mt-0.5 block text-xs text-slate-500">
              {isLoading ? "Reading photo…" : imageUrl ? "Photo ready · click to replace" : "PNG, JPG or WebP · max 12 MB"}
            </span>
          </span>
        {imageUrl && !isLoading ? (
          <CheckCircle2 size={18} className="ml-auto shrink-0 text-[#159568]" />
        ) : (
          <ImagePlus size={18} className="ml-auto shrink-0 text-slate-400" />
        )}
      </button>
    </>
  );
}
