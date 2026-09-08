// Template API service.

import type { CreateTemplatePayload, ProgramTemplate } from "@/shared/types/domain";
import { USE_MOCKS } from "@/shared/services/config";
import { apiRequest } from "@/shared/services/http";
import * as mock from "@/shared/services/mock/mockApi";

export const templateService = {
  getTemplates(signal?: AbortSignal): Promise<ProgramTemplate[]> {
    if (USE_MOCKS) return mock.getTemplates();
    return apiRequest<ProgramTemplate[]>("/api/templates.php", { signal });
  },

  getTemplatesByProgram(programId: string, signal?: AbortSignal): Promise<ProgramTemplate[]> {
    if (USE_MOCKS) return mock.getTemplatesByProgram(programId);
    return apiRequest<ProgramTemplate[]>(`/api/templates.php?programId=${encodeURIComponent(programId)}`, { signal });
  },

  /** Templates uploaded but not yet attached to any program. */
  async getUnassignedTemplates(signal?: AbortSignal): Promise<ProgramTemplate[]> {
    if (USE_MOCKS) return mock.getUnassignedTemplates();
    return apiRequest<ProgramTemplate[]>("/api/templates.php?unassigned=1", { signal });
  },

  createTemplate(payload: CreateTemplatePayload): Promise<ProgramTemplate> {
    if (USE_MOCKS) return mock.createTemplate(payload);
    return apiRequest<ProgramTemplate>("/api/templates.php", { method: "POST", body: payload });
  },

  setDefaultTemplate(programId: string, templateId: string): Promise<ProgramTemplate[]> {
    if (USE_MOCKS) return mock.setDefaultTemplate(programId, templateId);
    return apiRequest<ProgramTemplate[]>(
      `/api/templates.php?id=${encodeURIComponent(templateId)}`,
      { method: "PATCH", body: { isDefault: true } },
    );
  },

  /** Attaches an existing (typically unassigned) template to a program. */
  assignTemplate(templateId: string, programId: string): Promise<ProgramTemplate> {
    if (USE_MOCKS) return mock.assignTemplate(templateId, programId);
    return apiRequest<ProgramTemplate>(
      `/api/templates.php?id=${encodeURIComponent(templateId)}`,
      { method: "PATCH", body: { programId } },
    );
  },
};
