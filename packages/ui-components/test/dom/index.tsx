import {
  render as testingLibraryRender,
  screen,
  within,
  type RenderOptions
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactElement } from "react";
import { vi } from "vitest";

const portalRootId = "vf-test-portal-root";

export function getPortalRoot() {
  const existing = document.getElementById(portalRootId);

  if (existing) {
    return existing;
  }

  const portalRoot = document.createElement("div");
  portalRoot.id = portalRootId;
  document.body.append(portalRoot);
  return portalRoot;
}

export function cleanupPortalRoot() {
  document.getElementById(portalRootId)?.remove();
}

export function render(ui: ReactElement, options?: RenderOptions) {
  const result = testingLibraryRender(ui, {
    baseElement: document.body,
    ...options
  });

  return {
    ...result,
    portalRoot: getPortalRoot()
  };
}

export function createUser() {
  return userEvent.setup();
}

export function createUserWithFakeTimers() {
  return userEvent.setup({
    advanceTimers: (milliseconds) => vi.advanceTimersByTime(milliseconds)
  });
}

export { screen, within };
