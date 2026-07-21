import { cleanup } from "@testing-library/react";
import { afterEach, beforeEach, vi } from "vitest";

const portalRootId = "vf-test-portal-root";

beforeEach(() => {
  const portalRoot = document.createElement("div");
  portalRoot.id = portalRootId;
  document.body.append(portalRoot);
});

afterEach(() => {
  cleanup();
  document.getElementById(portalRootId)?.remove();
  vi.clearAllTimers();
  vi.restoreAllMocks();
  vi.useRealTimers();
});
