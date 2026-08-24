import { cpSync, existsSync, mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";

declare const process: {
  env: {
    VITE_BASE_PATH?: string;
  };
};

const appDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(appDirectory, "../..");

function publishConsumerContext(): Plugin {
  return {
    name: "publish-vyrnforge-consumer-context",
    closeBundle() {
      const dist = path.join(appDirectory, "dist");
      mkdirSync(dist, { recursive: true });
      const aiSource = path.join(repositoryRoot, "docs/generated/ai-context");
      if (existsSync(aiSource)) {
        cpSync(aiSource, path.join(dist, "ai-context"), { recursive: true });
      }
      cpSync(
        path.join(repositoryRoot, "docs/generated/consumer-knowledge.json"),
        path.join(dist, "consumer-knowledge.json")
      );
    }
  };
}

export default defineConfig(({ mode }) => ({
  base: process.env.VITE_BASE_PATH ?? (mode === "production" ? "/vyrnforge-ui/" : "/"),
  plugins: [react(), publishConsumerContext()],
  server: {
    port: 5174
  }
}));
