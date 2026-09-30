import { describe, expect, it } from "vitest";

import {
  VfButton,
  VfDialog,
  VfTabs,
  VfTextInput,
  createVyrnForgeVueToastService,
  useVyrnForgeToast,
  vyrnForgeToastKey,
} from "./index";

describe("@vyrnforge/ui-vue public entrypoint", () => {
  it.each([
    ["VfButton", VfButton],
    ["VfDialog", VfDialog],
    ["VfTabs", VfTabs],
    ["VfTextInput", VfTextInput],
  ])("exports %s from the generated Vue facade", (name, component) => {
    expect(component).toBeDefined();
    expect(component.name).toBe(name);
  });

  it("exports the Vue toast service adapter", () => {
    expect(typeof createVyrnForgeVueToastService).toBe("function");
    expect(typeof useVyrnForgeToast).toBe("function");
    expect(typeof vyrnForgeToastKey).toBe("symbol");
  });
});
