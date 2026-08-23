import { render, screen } from "../../../../tests/dom";
import { describe, expect, it } from "vitest";
import {
  composeCanonicalChildren,
  mapNamedContentToCanonicalSlots,
} from "../internal/react-native-composition";

describe("MFD-1405 React composition mapping", () => {
  it("preserves element identity while assigning canonical slot names", () => {
    const [icon] = mapNamedContentToCanonicalSlots({
      prefix: <strong data-testid="prefix">P</strong>,
    });
    render(<div>{icon}</div>);
    expect(screen.getByTestId("prefix")).toHaveAttribute("slot", "prefix");
    expect(screen.getByTestId("prefix").tagName).toBe("STRONG");
  });

  it("wraps primitive named content without changing default children", () => {
    render(
      <div data-testid="host">
        {composeCanonicalChildren("Body", { prefix: "Lead", suffix: null })}
      </div>,
    );
    const host = screen.getByTestId("host");
    expect(host.querySelector('[slot="prefix"]')).toHaveTextContent("Lead");
    expect(host).toHaveTextContent("Body");
    expect(host.querySelector('[slot="suffix"]')).toBeNull();
  });
});
