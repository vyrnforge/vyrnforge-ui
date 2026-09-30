import { createApp } from "vue";
import { describe, expect, it } from "vitest";

import {
  createVyrnForgeVueToastService,
  useVyrnForgeToast,
  vyrnForgeToastKey,
} from "./toast";

describe("Vue toast service adapter", () => {
  it("creates the shared browser service without Vue-owned state", () => {
    const service = createVyrnForgeVueToastService();
    const id = service.info({
      description: "Details",
      duration: null,
      title: "Notice",
    });

    expect(service.getSnapshot().records[0]).toMatchObject({
      id,
      payload: {
        description: "Details",
        title: "Notice",
        tone: "info",
      },
    });
    service.destroy();
  });

  it("resolves the service through Vue injection without a DOM", () => {
    const service = createVyrnForgeVueToastService();
    const app = createApp({});
    app.provide(vyrnForgeToastKey, service);

    const resolved = app.runWithContext(() => useVyrnForgeToast());
    expect(resolved).toBe(service);

    service.destroy();
  });
});
