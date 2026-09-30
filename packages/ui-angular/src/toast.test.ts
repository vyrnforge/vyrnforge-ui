import { describe, expect, it } from "vitest";

type ToastModule = typeof import("./toast.js");
type ToastService = ToastModule["VyrnForgeToastService"];

const toastServiceSurfaceIsTyped: ToastService extends {
  dismiss(id: string): boolean;
  dismissAll(): boolean;
  error(record: unknown): string;
  getSnapshot(): unknown;
  info(record: unknown): string;
  pause(id: string): boolean;
  resume(id: string): boolean;
  success(record: unknown): string;
  toast(record: unknown): string;
  triggerAction(id: string): boolean;
  update(id: string, record: unknown): boolean;
  warning(record: unknown): string;
}
  ? true
  : false = true;

describe("VyrnForgeToastService", () => {
  it("exposes the shared toast lifecycle through the Angular public type", () => {
    expect(toastServiceSurfaceIsTyped).toBe(true);
  });
});
