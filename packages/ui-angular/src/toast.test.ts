import { describe, expect, it } from "vitest";

type ToastModule = typeof import("./toast.js");
type ToastService = ToastModule["VyrnForgeToastService"];
type RequiredMethod =
  | "dismiss"
  | "dismissAll"
  | "error"
  | "getSnapshot"
  | "info"
  | "pause"
  | "resume"
  | "success"
  | "toast"
  | "triggerAction"
  | "update"
  | "warning";

const toastServiceSurfaceIsTyped: RequiredMethod extends keyof ToastService
  ? true
  : false = true;

describe("VyrnForgeToastService", () => {
  it("exposes the shared toast lifecycle through the Angular public type", () => {
    expect(toastServiceSurfaceIsTyped).toBe(true);
  });
});
