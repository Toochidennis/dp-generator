// Admin session service. Backed by PHP sessions + a CSRF token (see api/auth.php).
// No-op-ish in mock mode: AdminLayout skips the guard entirely while USE_MOCKS.

import { apiRequest, setCsrfToken } from "@/shared/services/http";

export type AdminSession = { authenticated: true; username: string; csrfToken: string };

export const authService = {
  async me(signal?: AbortSignal): Promise<AdminSession | null> {
    try {
      const session = await apiRequest<AdminSession>("/api/auth.php", { signal });
      setCsrfToken(session.csrfToken);
      return session;
    } catch {
      return null;
    }
  },

  async login(username: string, password: string): Promise<AdminSession> {
    const session = await apiRequest<AdminSession>("/api/auth.php", {
      method: "POST",
      body: { action: "login", username, password },
    });
    setCsrfToken(session.csrfToken);
    return session;
  },

  async logout(): Promise<void> {
    await apiRequest("/api/auth.php", { method: "POST", body: { action: "logout" } });
    setCsrfToken(undefined);
  },
};
