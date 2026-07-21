import {
  assertNoAccessibilityViolations,
  createUser,
  render,
  screen,
} from "../../../tests/dom";
import { describe, expect, it } from "vitest";
import { FixtureApp } from "./FixtureApp";
import {
  componentMetadataById,
  fixtureRegistry,
  resolveFixtureRoute,
} from "./fixtureRegistry";

describe("regression fixture application", () => {
  it("registers unique fixture IDs and routes", () => {
    expect(new Set(fixtureRegistry.map((fixture) => fixture.id)).size).toBe(
      fixtureRegistry.length,
    );
    expect(new Set(fixtureRegistry.map((fixture) => fixture.route)).size).toBe(
      fixtureRegistry.length,
    );
  });

  it("resolves every registered route", () => {
    fixtureRegistry.forEach((fixture) => {
      expect(resolveFixtureRoute(fixture.route)).toBe(fixture);
    });
  });

  it("references valid public component metadata", () => {
    fixtureRegistry.forEach((fixture) => {
      const component = componentMetadataById.get(fixture.componentMetadataId);

      expect(component).toBeDefined();
      expect(component?.publicExport).toBe(true);
    });
  });

  it("renders representative control, form, overlay, and grid fixtures", async () => {
    const user = createUser();
    const cases = [
      ["/fixtures/button/basic", "button", "Create case"],
      ["/fixtures/text-input/validation", "textbox", "Case title"],
      ["/fixtures/autocomplete/controlled", "combobox", "Workspace role"],
      ["/fixtures/multi-select/keyboard", "button", "Workspace permissions"],
      ["/fixtures/transfer-list/assignment", "group", "Application assignment"],
      [
        "/fixtures/forms/slider-rating-keyboard",
        "slider",
        "Approval threshold",
      ],
      ["/fixtures/navigation/tabs-toggle-keyboard", "tab", "Summary"],
      ["/fixtures/toast/lifecycle", "button", "Show success"],
      ["/fixtures/data-grid/selection", "region", "Fixture cases"],
    ] as const;

    cases.forEach(([pathname, role, name]) => {
      const result = render(<FixtureApp initialPathname={pathname} />);

      expect(screen.getByRole(role, { name })).toBeTruthy();
      result.unmount();
    });

    const dialogResult = render(
      <FixtureApp initialPathname="/fixtures/dialog/focus" />,
    );
    await user.click(screen.getByRole("button", { name: "Open confirmation" }));
    expect(
      screen.getByRole("dialog", { name: "Confirm case update" }),
    ).toBeTruthy();
    dialogResult.unmount();
  });

  it("applies fixture theme and density controls", async () => {
    const user = createUser();
    render(<FixtureApp initialPathname="/fixtures/button/basic" />);

    await user.selectOptions(
      screen.getByRole("combobox", { name: "Fixture theme" }),
      "dark",
    );
    await user.selectOptions(
      screen.getByRole("combobox", { name: "Fixture density" }),
      "compact",
    );

    const fixture = document.querySelector('[data-vf-fixture="button-basic"]');
    expect(fixture?.getAttribute("data-theme")).toBe("dark");
    expect(fixture?.getAttribute("data-density")).toBe("compact");
  });

  it("renders a deterministic not-found state for an unknown route", () => {
    render(<FixtureApp initialPathname="/fixtures/unknown" />);

    expect(
      screen.getByRole("heading", { name: "Fixture not found" }),
    ).toBeTruthy();
    expect(
      screen.getByText("Unknown fixture route: /fixtures/unknown"),
    ).toBeTruthy();
  });

  it("has no automated accessibility violations for representative overlay fixtures", async () => {
    const user = createUser();
    const dialog = render(
      <FixtureApp initialPathname="/fixtures/dialog/focus" />,
    );
    await user.click(screen.getByRole("button", { name: "Open confirmation" }));
    await assertNoAccessibilityViolations(document.body);
    dialog.unmount();

    const menu = render(
      <FixtureApp initialPathname="/fixtures/menu/keyboard" />,
    );
    await user.click(screen.getByRole("button", { name: "Open case actions" }));
    await assertNoAccessibilityViolations(document.body, {
      rules: {
        // Component portals intentionally render beside the app landmark. Page-level
        // landmark coverage remains a browser-audit responsibility.
        region: { enabled: false },
      },
    });
    menu.unmount();

    const autocomplete = render(
      <FixtureApp initialPathname="/fixtures/autocomplete/controlled" />,
    );
    await user.click(screen.getByRole("combobox", { name: "Workspace role" }));
    await assertNoAccessibilityViolations(document.body, {
      rules: { region: { enabled: false } },
    });
    autocomplete.unmount();

    const multiSelect = render(
      <FixtureApp initialPathname="/fixtures/multi-select/keyboard" />,
    );
    await user.click(
      screen.getByRole("button", { name: "Workspace permissions" }),
    );
    await assertNoAccessibilityViolations(document.body);
    multiSelect.unmount();
  });
});
