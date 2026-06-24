// Program API service. Components use this; they never call fetch directly.

import type {
  CreateProgramPayload,
  GenerateAttendancePayload,
  GenerateAttendanceResult,
  Program,
  UpdateProgramPayload,
} from "@/shared/types/domain";
import { USE_MOCKS } from "@/shared/services/config";
import { apiRequest } from "@/shared/services/http";
import * as mock from "@/shared/services/mock/mockApi";

export const programService = {
  getPrograms(signal?: AbortSignal): Promise<Program[]> {
    if (USE_MOCKS) return mock.getPrograms();
    return apiRequest<Program[]>("/api/admin/programs", { signal });
  },

  getProgramById(id: string, signal?: AbortSignal): Promise<Program> {
    if (USE_MOCKS) return mock.getProgramById(id);
    return apiRequest<Program>(`/api/admin/programs/${encodeURIComponent(id)}`, { signal });
  },

  getProgramBySlug(slug: string, signal?: AbortSignal): Promise<Program> {
    if (USE_MOCKS) return mock.getProgramBySlug(slug);
    return apiRequest<Program>(`/api/public/programs/${encodeURIComponent(slug)}`, { signal });
  },

  createProgram(payload: CreateProgramPayload): Promise<Program> {
    if (USE_MOCKS) return mock.createProgram(payload);
    return apiRequest<Program>("/api/admin/programs", { method: "POST", body: payload });
  },

  updateProgram(id: string, payload: UpdateProgramPayload): Promise<Program> {
    if (USE_MOCKS) return mock.updateProgram(id, payload);
    return apiRequest<Program>(`/api/admin/programs/${encodeURIComponent(id)}`, { method: "PATCH", body: payload });
  },

  archiveProgram(id: string): Promise<Program> {
    if (USE_MOCKS) return mock.archiveProgram(id);
    return apiRequest<Program>(`/api/admin/programs/${encodeURIComponent(id)}`, { method: "PATCH", body: { status: "archived" } });
  },

  generateAttendance(slug: string, payload: GenerateAttendancePayload): Promise<GenerateAttendanceResult> {
    if (USE_MOCKS) return mock.generateAttendance(slug, payload);
    const body = new FormData();
    body.append("name", payload.name);
    body.append("templateId", payload.templateId);
    if (payload.photo) body.append("photo", payload.photo);
    return apiRequest<GenerateAttendanceResult>(`/api/public/programs/${encodeURIComponent(slug)}/generate`, { method: "POST", body });
  },
};
