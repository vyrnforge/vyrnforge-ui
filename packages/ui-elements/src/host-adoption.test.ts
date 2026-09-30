import { describe, expect, it } from "vitest";

import {
  findVyrnForgeNamedRegion,
  resolveVyrnForgeHostAdoption,
  resolveVyrnForgeHostClasses,
  resolveVyrnForgeHostTag,
  vyrnForgeHostAdoptionContracts,
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

  it("does not encode framework node or template types", () => {
    expect(JSON.stringify(vyrnForgeHostAdoptionContracts)).not.toMatch(
      /ReactNode|TemplateRef|VNode/,
    );
  });
});
