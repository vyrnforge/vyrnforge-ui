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
});
