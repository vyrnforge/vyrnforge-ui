import { createSSRApp, h } from "vue";
import { renderToString } from "vue/server-renderer";
import { describe, expect, it } from "vitest";

import { VfButton, VyrnForgeVue } from "./index";

describe("@vyrnforge/ui-vue SSR", () => {
  it("renders the facade without browser globals", async () => {
    expect(typeof window).toBe("undefined");
    expect(typeof document).toBe("undefined");

    const app = createSSRApp({
      render: () => h(VfButton, { id: "ssr-button" }, { default: () => "SSR" }),
    });
    app.use(VyrnForgeVue);

    const html = await renderToString(app);
    expect(html).toContain("vf-button");
    expect(html).toContain("SSR");
  });
});
