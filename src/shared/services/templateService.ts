// Template API service.

import type { CreateTemplatePayload, ProgramTemplate } from "@/shared/types/domain";
import { USE_MOCKS } from "@/shared/services/config";
import { apiRequest } from "@/shared/services/http";
import * as mock from "@/shared/services/mock/mockApi";

export const templateService = {
  getTemplates(signal?: AbortSignal): Promise<ProgramTemplate[]> {
    if (USE_MOCKS) return mock.getTemplates();
    return apiRequest<ProgramTemplate[]>("/api/admin/templates", { signal });
  },

  getTemplatesByProgram(programId: string, signal?: AbortSignal): Promise<ProgramTemplate[]> {
    if (USE_MOCKS) return mock.getTemplatesByProgram(programId);
    return apiRequest<ProgramTemplate[]>(`/api/admin/programs/${encodeURIComponent(programId)}/templates`, { signal });
  },

  createTemplate(payload: CreateTemplatePayload): Promise<ProgramTemplate> {
    if (USE_MOCKS) return mock.createTemplate(payload);
    return apiRequest<ProgramTemplate>(`/api/admin/programs/${encodeURIComponent(payload.programId)}/templates`, { method: "POST", body: payload });
  },

  setDefaultTemplate(programId: string, templateId: string): Promise<ProgramTemplate[]> {
    if (USE_MOCKS) return mock.setDefaultTemplate(programId, templateId);
    return apiRequest<ProgramTemplate[]>(`/api/admin/programs/${encodeURIComponent(programId)}/templates/${encodeURIComponent(templateId)}`, { method: "PATCH", body: { isDefault: true } });
  },
};
