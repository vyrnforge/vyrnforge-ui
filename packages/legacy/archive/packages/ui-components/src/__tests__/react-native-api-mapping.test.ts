import { describe, expect, it, vi } from "vitest";
import { mapReactPropsToCanonical } from "../internal/react-native-api-mapping";

describe("MFD-1404 React API mapping", () => {
  it("maps idiomatic React props to canonical properties with defaults", () => {
    const bindings = mapReactPropsToCanonical(
      { disabled: undefined, size: "lg", onValueChange: undefined },
      {
        properties: [
          {
            reactProp: "disabled",
            canonicalProperty: "disabled",
            defaultValue: false,
          },
          { reactProp: "size", canonicalProperty: "size", defaultValue: "md" },
        ],
      },
    );
    expect(bindings.properties).toEqual({ disabled: false, size: "lg" });
  });

  it("translates canonical events into React callbacks without exposing vf event plumbing", () => {
    const onValueChange = vi.fn();
    const bindings = mapReactPropsToCanonical(
      { onValueChange },
      {
        events: [
          {
            reactCallback: "onValueChange",
            canonicalEvent: "vf-change",
            mapDetail: (detail: unknown) => (detail as { value: string }).value,
          },
        ],
      },
    );
    const event = new CustomEvent("vf-change", { detail: { value: "next" } });
    bindings.events["vf-change"]?.(event.detail, event);
    expect(onValueChange).toHaveBeenCalledWith("next", event);
  });
});
