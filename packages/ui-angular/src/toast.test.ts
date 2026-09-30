import { describe, expect, it } from "vitest";

import { VyrnForgeToastService } from "./toast";

describe("VyrnForgeToastService", () => {
  it("adapts the shared browser toast service without owning state", () => {
    const service = new VyrnForgeToastService();
    const id = service.success({
      description: "Saved",
      duration: null,
      title: "Done",
    });

    expect(service.getSnapshot().records[0]).toMatchObject({
      id,
      payload: {
        description: "Saved",
        title: "Done",
        tone: "success",
      },
    });
    expect(service.update(id, { description: "Updated" })).toBe(true);
    expect(service.dismiss(id)).toBe(true);

    service.ngOnDestroy();
  });
});
