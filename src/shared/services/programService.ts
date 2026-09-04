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
    // Same PHP endpoint serves both: an authenticated admin session gets every
    // program, an anonymous caller (the public home page) gets active ones only.
    return apiRequest<Program[]>("/api/programs.php", { signal });
  },

  getProgramById(id: string, signal?: AbortSignal): Promise<Program> {
    if (USE_MOCKS) return mock.getProgramById(id);
    return apiRequest<Program>(`/api/programs.php?id=${encodeURIComponent(id)}`, { signal });
  },

  getProgramBySlug(slug: string, signal?: AbortSignal): Promise<Program> {
    if (USE_MOCKS) return mock.getProgramBySlug(slug);
    return apiRequest<Program>(`/api/programs.php?slug=${encodeURIComponent(slug)}`, { signal });
  },

  createProgram(payload: CreateProgramPayload): Promise<Program> {
    if (USE_MOCKS) return mock.createProgram(payload);
    return apiRequest<Program>("/api/programs.php", { method: "POST", body: payload });
  },

  updateProgram(id: string, payload: UpdateProgramPayload): Promise<Program> {
    if (USE_MOCKS) return mock.updateProgram(id, payload);
    return apiRequest<Program>(`/api/programs.php?id=${encodeURIComponent(id)}`, { method: "PATCH", body: payload });
  },

  archiveProgram(id: string): Promise<Program> {
    if (USE_MOCKS) return mock.archiveProgram(id);
    return apiRequest<Program>(`/api/programs.php?id=${encodeURIComponent(id)}`, { method: "PATCH", body: { status: "archived" } });
  },

  generateAttendance(slug: string, payload: GenerateAttendancePayload): Promise<GenerateAttendanceResult> {
    if (USE_MOCKS) return mock.generateAttendance(slug, payload);
    const body = new FormData();
    body.append("name", payload.name);
    body.append("templateId", payload.templateId);
    if (payload.photo) body.append("photo", payload.photo);
    // Not implemented server-side yet — see api/generate.php (returns 501).
    return apiRequest<GenerateAttendanceResult>(`/api/generate.php?slug=${encodeURIComponent(slug)}`, { method: "POST", body });
  },
};
