import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath, URL } from "node:url";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  server: {
    allowedHosts: [
      "d53e-2605-59c0-e97-4e10-735f-5c0d-9b6d-4798.ngrok-free.app",
    ],
    // Local dev against the real PHP backend (VITE_USE_MOCKS=false): proxy
    // same-origin so the session cookie isn't dropped as cross-site. Point
    // it at `php -S` (or any PHP dev server) via PHP_DEV_PROXY_TARGET; leave
    // unset (the default) to keep using mocks with no backend running.
    proxy: process.env.PHP_DEV_PROXY_TARGET
      ? {
          "/api": process.env.PHP_DEV_PROXY_TARGET,
          "/uploads": process.env.PHP_DEV_PROXY_TARGET,
        }
      : undefined,
  },
});
