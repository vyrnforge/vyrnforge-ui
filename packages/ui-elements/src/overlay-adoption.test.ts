import { describe, expect, it } from "vitest";

import {
  findVyrnForgeOverlayRegion,
  vyrnForgeOverlayAdoptionContracts,
} from "./overlay-adoption";

describe("overlay adoption contracts", () => {
  it("describes rich overlay ownership without framework content types", () => {
    expect(vyrnForgeOverlayAdoptionContracts.popover.capabilities).toEqual(
      expect.arrayContaining([
        "anchored-placement",
        "controlled-open",
        "portal-target",
        "rich-content",
        "trigger-ownership",
      ]),
    );
    expect(
      findVyrnForgeOverlayRegion(
        vyrnForgeOverlayAdoptionContracts.popover,
        "content",
      ),
    ).toMatchObject({ className: "vf-popover__content", required: true });
  });

  it("captures the advanced autocomplete extension surface", () => {
    expect(vyrnForgeOverlayAdoptionContracts.autocomplete.capabilities).toEqual(
      expect.arrayContaining([
        "anchored-placement",
        "controlled-open",
        "custom-filter",
        "custom-render",
        "portal-target",
        "rich-content",
      ]),
    );
    expect(
      findVyrnForgeOverlayRegion(
        vyrnForgeOverlayAdoptionContracts.autocomplete,
        "option",
      )?.className,
    ).toBe("vf-autocomplete__option-main");
  });

  it("keeps toast lifecycle and modal focus capabilities explicit", () => {
    expect(vyrnForgeOverlayAdoptionContracts.toast.capabilities).toContain(
      "toast-lifecycle",
    );
    expect(vyrnForgeOverlayAdoptionContracts.dialog.capabilities).toEqual(
      expect.arrayContaining(["focus-containment", "focus-restoration"]),
    );
  });
});
