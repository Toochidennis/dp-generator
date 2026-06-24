// Generation API service.

import type { Generation, PublicGeneration } from "@/shared/types/domain";
import { USE_MOCKS } from "@/shared/services/config";
import { apiRequest } from "@/shared/services/http";
import * as mock from "@/shared/services/mock/mockApi";

export const generationService = {
  getGenerations(signal?: AbortSignal): Promise<Generation[]> {
    if (USE_MOCKS) return mock.getGenerations();
    return apiRequest<Generation[]>("/api/admin/generations", { signal });
  },

  getGenerationsByProgram(programId: string, signal?: AbortSignal): Promise<Generation[]> {
    if (USE_MOCKS) return mock.getGenerationsByProgram(programId);
    return apiRequest<Generation[]>(`/api/admin/generations?programId=${encodeURIComponent(programId)}`, { signal });
  },

  getPublicGeneration(generationId: string, signal?: AbortSignal): Promise<PublicGeneration> {
    if (USE_MOCKS) return mock.getPublicGeneration(generationId);
    return apiRequest<PublicGeneration>(`/api/public/generations/${encodeURIComponent(generationId)}`, { signal });
  },
};
