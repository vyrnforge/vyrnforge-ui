import { describe, expect, it } from "vitest";

type PublicApi = typeof import("./index.js");
type HasExport<Name extends PropertyKey> = Name extends keyof PublicApi
  ? true
  : false;
type Assert<T extends true> = T;

type ButtonExport = Assert<HasExport<"VfButton">>;
type TextInputExport = Assert<HasExport<"VfTextInput">>;
type TabsExport = Assert<HasExport<"VfTabs">>;
type DialogExport = Assert<HasExport<"VfDialog">>;

const publicSurfaceIsTyped: [
  ButtonExport,
  TextInputExport,
  TabsExport,
  DialogExport,
] = [true, true, true, true];

describe("@vyrnforge/ui-angular public surface", () => {
  it("type-checks the S11-proven generated directive exports", () => {
    expect(publicSurfaceIsTyped).toEqual([true, true, true, true]);
  });
});
