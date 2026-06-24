/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string;
  readonly VITE_DP_EXPORT_MODE?: "local" | "server";
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
