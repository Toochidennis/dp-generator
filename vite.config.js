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
    },
});
