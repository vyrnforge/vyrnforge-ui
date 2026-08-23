import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import {
  resolveReactCanonicalModel,
  useReactCanonicalModel,
} from "../internal/react-native-model";

describe("MFD-1407 React controlled/uncontrolled model adapter", () => {
  it("resolves controlled and uncontrolled initial state deterministically", () => {
    expect(resolveReactCanonicalModel("controlled", "default")).toEqual({
      value: "controlled",
      controlled: true,
    });
    expect(resolveReactCanonicalModel(undefined, "default")).toEqual({
      value: "default",
      controlled: false,
    });
  });

  it("updates internal state only for uncontrolled models while always emitting proposals", () => {
    const onChange = vi.fn();
    const { result, rerender } = renderHook(
      ({ value }: { value?: string }) =>
        useReactCanonicalModel({ value, defaultValue: "initial", onChange }),
      { initialProps: { value: undefined as string | undefined } },
    );

    expect(result.current.controlled).toBe(false);
    expect(result.current.value).toBe("initial");

    act(() => result.current.propose("next"));
    rerender({ value: undefined });
    expect(result.current.value).toBe("next");
    expect(onChange).toHaveBeenCalledWith("next");

    rerender({ value: "external" });
    expect(result.current.controlled).toBe(true);
    expect(result.current.value).toBe("external");

    act(() => result.current.propose("proposal"));
    rerender({ value: "external" });
    expect(result.current.value).toBe("external");
    expect(onChange).toHaveBeenCalledWith("proposal");
  });
});
