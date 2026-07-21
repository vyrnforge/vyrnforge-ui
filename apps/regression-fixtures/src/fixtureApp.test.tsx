import {
  assertNoAccessibilityViolations,
  createUser,
  render,
  screen,
} from "../../../packages/ui-components/test/dom";
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

  it("renders representative control, form, overlay, and grid fixtures", () => {
    const cases = [
      ["/fixtures/button/basic", "button", "Create case"],
      ["/fixtures/text-input/validation", "textbox", "Case title"],
      ["/fixtures/dialog/focus", "dialog", "Confirm case update"],
      ["/fixtures/data-grid/selection", "region", "Fixture cases"],
    ] as const;

    cases.forEach(([pathname, role, name]) => {
      const result = render(<FixtureApp initialPathname={pathname} />);

      expect(screen.getByRole(role, { name })).toBeTruthy();
      result.unmount();
    });
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

  it("has no automated accessibility violations for the basic button fixture", async () => {
    const { container } = render(
      <FixtureApp initialPathname="/fixtures/button/basic" />,
    );

    await assertNoAccessibilityViolations(container);
  });
});
