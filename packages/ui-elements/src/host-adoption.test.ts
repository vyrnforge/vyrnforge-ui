import { describe, expect, it } from "vitest";

import {
  findVyrnForgeItemRegion,
  findVyrnForgeNamedRegion,
  resolveVyrnForgeHostAdoption,
  resolveVyrnForgeHostClasses,
  resolveVyrnForgeHostTag,
  vyrnForgeHostAdoptionContracts,
  vyrnForgeItemCompositionContracts,
} from "./host-adoption";

describe("host adoption contracts", () => {
  it("preserves supported semantic native typography tags", () => {
    expect(
      resolveVyrnForgeHostTag(vyrnForgeHostAdoptionContracts.text, "span"),
    ).toBe("span");
    expect(
      resolveVyrnForgeHostTag(vyrnForgeHostAdoptionContracts.caption, "p"),
    ).toBe("p");
    expect(
      resolveVyrnForgeHostTag(
        vyrnForgeHostAdoptionContracts["code-text"],
        "span",
      ),
    ).toBe("span");
    expect(
      resolveVyrnForgeHostTag(vyrnForgeHostAdoptionContracts.heading, "h5"),
    ).toBe("h5");
  });

  it("falls back to the canonical default tag for unsupported hosts", () => {
    expect(
      resolveVyrnForgeHostTag(vyrnForgeHostAdoptionContracts.text, "button"),
    ).toBe("p");
    expect(
      resolveVyrnForgeHostTag(vyrnForgeHostAdoptionContracts.card, "section"),
    ).toBe("div");
  });

  it("resolves shared layout classes without owning DOM nodes", () => {
    expect(
      resolveVyrnForgeHostClasses(vyrnForgeHostAdoptionContracts.card, {
        padding: "lg",
        variant: "elevated",
      }),
    ).toEqual(["vf-card", "vf-card--elevated", "vf-card--padding-lg"]);

    expect(
      resolveVyrnForgeHostClasses(vyrnForgeHostAdoptionContracts.inline, {
        align: "center",
        gap: "sm",
        justify: "between",
        wrap: true,
      }),
    ).toEqual([
      "vf-inline",
      "vf-inline--gap-sm",
      "vf-inline--align-center",
      "vf-inline--justify-between",
      "vf-inline--wrap",
    ]);
  });

  it("describes rich named regions independently from framework content types", () => {
    const pageHeader = resolveVyrnForgeHostAdoption(
      vyrnForgeHostAdoptionContracts["page-header"],
    );
    expect(pageHeader.tagName).toBe("header");
    expect(pageHeader.regions.map((region) => region.name)).toEqual([
      "breadcrumbs",
      "row",
      "main",
      "eyebrow",
      "title-row",
      "title",
      "status",
      "description",
      "metadata",
      "actions",
    ]);
    expect(
      findVyrnForgeNamedRegion(
        vyrnForgeHostAdoptionContracts["app-shell"],
        "sidebar",
      ),
    ).toMatchObject({
      className: "vf-app-shell__sidebar",
      semanticTag: "aside",
    });
  });

  it("describes rich navigation and collection item regions without framework nodes", () => {
    expect(vyrnForgeItemCompositionContracts.tabs).toMatchObject({
      identityProperty: "id",
      capabilities: ["roving-focus", "selection"],
    });
    expect(
      findVyrnForgeItemRegion(vyrnForgeItemCompositionContracts["side-nav"], "children"),
    ).toMatchObject({ multiplicity: "multiple" });
    expect(vyrnForgeItemCompositionContracts["multi-select"].capabilities).toEqual([
      "filter",
      "multiple-selection",
      "repeated-form-value",
      "roving-focus",
    ]);
    expect(
      findVyrnForgeItemRegion(vyrnForgeItemCompositionContracts["transfer-list"], "option"),
    ).toMatchObject({ className: "vf-transfer-list__option-content" });
  });

  it("does not encode framework node or template types", () => {
    expect(
      JSON.stringify({
        host: vyrnForgeHostAdoptionContracts,
        item: vyrnForgeItemCompositionContracts,
      }),
    ).not.toMatch(/ReactNode|TemplateRef|VNode/);
  });
});
