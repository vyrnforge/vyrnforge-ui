import { createApp, defineComponent, h } from "vue";
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

  it("resolves the service through Vue injection", () => {
    const service = createVyrnForgeVueToastService();
    let resolved: unknown;
    const app = createApp(
      defineComponent({
        setup() {
          resolved = useVyrnForgeToast();
          return () => h("div");
        },
      }),
    );
    app.provide(vyrnForgeToastKey, service);

    const element = document.createElement("div");
    app.mount(element);
    expect(resolved).toBe(service);

    app.unmount();
    service.destroy();
  });
});
