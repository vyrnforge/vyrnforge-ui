import { describe, expect, it } from "vitest";

import { createVyrnForgeToastService } from "./toast-service";

describe("VyrnForge browser toast service", () => {
  it("maps tone shortcuts and lifecycle onto the shared behavior service", () => {
    const service = createVyrnForgeToastService({
      createId: () => "toast-one",
      defaultDuration: 1000,
    });

    const id = service.success({
      description: "Saved",
      duration: null,
      title: "Done",
    });

    expect(id).toBe("toast-one");
    expect(service.getSnapshot().records[0]).toMatchObject({
      id: "toast-one",
      duration: null,
      payload: {
        description: "Saved",
        title: "Done",
        tone: "success",
      },
    });
    expect(service.update(id, { description: "Updated" })).toBe(true);
    expect(service.pause(id)).toBe(true);
    expect(service.resume(id)).toBe(true);
    expect(service.triggerAction(id)).toBe(true);
    expect(service.dismiss(id)).toBe(true);

    service.destroy();
  });

  it("covers neutral/default ids, shortcuts, updates, bulk dismissal, and scheduler lifecycle", () => {
    const service = createVyrnForgeToastService({ defaultDuration: null });

    const neutralId = service.toast({
      actionLabel: "Undo",
      description: "Neutral",
      dismissible: false,
      title: "Notice",
    });
    const errorId = service.error({ description: "Error" });
    service.warning({ description: "Warning" });
    service.info({ description: "Info" });

    expect(neutralId).toMatch(/^vf-toast-/);
    expect(service.getSnapshot().records.map((record) => record.payload.tone)).toEqual([
      "neutral",
      "error",
      "warning",
      "info",
    ]);
    expect(
      service.update(neutralId, {
        actionLabel: "Retry",
        createdAt: 10,
        dismissible: true,
        duration: 500,
        title: "Updated",
        tone: "success",
      }),
    ).toBe(true);
    expect(service.update("missing", { title: "Ignored" })).toBe(false);
    expect(service.dismiss(errorId, "programmatic")).toBe(true);

    service.start();
    service.stop();
    expect(service.dismissAll()).toBe(true);
    expect(service.getSnapshot().records).toHaveLength(0);

    service.destroy();
  });
});
