import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

declare const process: {
  env: {
    VITE_BASE_PATH?: string;
  };
};

export default defineConfig(({ mode }) => ({
  base: process.env.VITE_BASE_PATH ?? (mode === "production" ? "/vyrnforge-ui/" : "/"),
  plugins: [react()],
  server: {
    port: 5174
  }
}));
