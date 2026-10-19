import { describe, expect, it, vi } from "vitest";
import {
  assignForwardedRef,
  createCanonicalMethodHandle,
} from "../internal/react-native-methods";

describe("MFD-1406 React ref and imperative method bridge", () => {
  it("binds canonical imperative methods to the underlying element", () => {
    const element = {
      value: "ready",
      focus() {
        return this.value;
      },
      reportValidity() {
        return this.value === "ready";
      },
    };
    const handle = createCanonicalMethodHandle(element, [
      "focus",
      "reportValidity",
    ] as const);

    expect(handle.focus()).toBe("ready");
    expect(handle.reportValidity()).toBe(true);
  });

  it("fails fast when canonical metadata names a missing method", () => {
    const element = { focus: "not-callable" };
    expect(() => createCanonicalMethodHandle(element, ["focus"])).toThrow(
      /focus.*not callable/u,
    );
  });

  it("supports callback and object forwarded refs", () => {
    const value = { focus: vi.fn() };
    const callbackRef = vi.fn();
    const objectRef = { current: null as typeof value | null };

    assignForwardedRef(callbackRef, value);
    assignForwardedRef(objectRef, value);

    expect(callbackRef).toHaveBeenCalledWith(value);
    expect(objectRef.current).toBe(value);
  });
});
