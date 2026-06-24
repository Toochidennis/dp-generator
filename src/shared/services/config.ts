// Central configuration for the API service layer.

export const API_BASE_URL =
  (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, "") ?? "";

// The backend is developed separately. Until it is reachable we serve the UI
// from an isolated in-memory mock (see src/services/mock). Set
// VITE_USE_MOCKS=false to consume the real API instead.
export const USE_MOCKS =
  (import.meta.env.VITE_USE_MOCKS as string | undefined)?.toLowerCase() !== "false";
