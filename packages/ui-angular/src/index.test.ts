import { describe, expect, it } from "vitest";

import { VfButton, VfDialog, VfTabs, VfTextInput } from "./index.js";

describe("@vyrnforge/ui-angular public surface", () => {
  it("exports the S11-proven generated directives", () => {
    expect(VfButton).toBeTypeOf("function");
    expect(VfTextInput).toBeTypeOf("function");
    expect(VfTabs).toBeTypeOf("function");
    expect(VfDialog).toBeTypeOf("function");
  });
});
