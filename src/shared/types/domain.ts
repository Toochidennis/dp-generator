// Core domain model for the Program Attendance DP/PDF platform.
// These types mirror the backend API contract. The backend is built
// separately; the frontend only consumes it (see src/services).

export type ProgramStatus = "active" | "draft" | "archived";
export type TemplateStatus = "active" | "draft" | "archived";
export type TemplateType = "image" | "pdf";

export type ProgramTemplate = {
  id: string;
  programId: string;
  name: string;
  previewUrl: string;
  type: TemplateType;
  status: TemplateStatus;
  isDefault?: boolean;
};

export type Program = {
  id: string;
  title: string;
  slug: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  bannerUrl?: string;
  status: ProgramStatus;
  /** Attendance wording, supports {{name}} and {{programName}} tokens. */
  attendanceText: string;
  templates: ProgramTemplate[];
  generationCount?: number;
  createdAt?: string;
};

export type Generation = {
  id: string;
  programId: string;
  programTitle?: string;
  templateId: string;
  templateName?: string;
  participantName: string;
  generatedAt: string;
  pdfUrl?: string;
  imageUrl?: string;
  expiresAt?: string;
};

// ---- Request / response payloads ----

export type CreateProgramPayload = {
  title: string;
  slug: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  status: ProgramStatus;
  attendanceText: string;
  bannerUrl?: string;
  defaultTemplateId?: string;
};

export type UpdateProgramPayload = Partial<CreateProgramPayload>;

export type CreateTemplatePayload = {
  programId: string;
  name: string;
  previewUrl: string;
  type: TemplateType;
  status?: TemplateStatus;
  isDefault?: boolean;
};

export type GenerateAttendancePayload = {
  name: string;
  templateId: string;
  photo?: File;
};

export type GenerateAttendanceResult = {
  generationId: string;
  pdfUrl?: string;
  imageUrl?: string;
  expiresAt?: string;
};

// ---- Public share types ----

export type PublicGeneration = {
  id: string;
  participantName: string;
  programName: string;
  programSlug: string;
  attendanceText: string;
  imageUrl: string;
  pdfUrl: string;
  createdAt: string;
  expiresAt?: string;
};

// ---- UI helpers ----

export type AsyncStatus = "idle" | "loading" | "success" | "error";
export type ToastMessage = { id: number; type: "success" | "error"; message: string };

export function interpolateAttendanceText(
  text: string,
  values: { name: string; programName: string },
): string {
  return text
    .replace(/\{\{\s*name\s*\}\}/gi, values.name)
    .replace(/\{\{\s*programName\s*\}\}/gi, values.programName);
}
