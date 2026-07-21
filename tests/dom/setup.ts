import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, beforeEach, vi } from "vitest";
import { cleanupPortalRoot, getPortalRoot } from "./index";

beforeEach(() => {
  getPortalRoot();
});

afterEach(() => {
  cleanup();
  cleanupPortalRoot();
  vi.clearAllTimers();
  vi.restoreAllMocks();
  vi.useRealTimers();
});
