import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    // This test fixture intentionally aggregates broad VyrnForge surfaces into
    // one deterministic application; its bundle is not a shipped package budget.
    chunkSizeWarningLimit: 750,
  },
});
