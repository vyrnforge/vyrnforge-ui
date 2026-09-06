import { describe, expect, it } from "vitest";

import {
  convertAngularFormValueToElement,
  convertElementValueToAngularForm,
  getVyrnForgeAngularFormValueModel,
  vyrnForgeAngularFormValueModels,
} from "./forms-value-models.js";

describe("VyrnForge Angular Forms value models", () => {
  it("covers every supported tag exactly once across the five model kinds", () => {
    expect(vyrnForgeAngularFormValueModels).toHaveLength(14);
    expect(
      new Set(vyrnForgeAngularFormValueModels.map((model) => model.tagName)).size,
    ).toBe(14);
    expect(
      new Set(vyrnForgeAngularFormValueModels.map((model) => model.kind)),
    ).toEqual(
      new Set(["value", "checked", "numeric", "collection", "selection"]),
    );
  });

  it("keeps plain value models as strings without silent coercion", () => {
    expect(convertAngularFormValueToElement("vf-text-input", "owner")).toEqual({
      property: "value",
      modelValue: "owner",
      elementValue: "owner",
    });
    expect(convertAngularFormValueToElement("vf-date-input", null)).toEqual({
      property: "value",
      modelValue: null,
      elementValue: "",
    });
    expect(convertElementValueToAngularForm("vf-search-input", "query")).toBe(
      "query",
    );
    expect(() =>
      convertAngularFormValueToElement("vf-textarea", 42),
    ).toThrow(TypeError);
    expect(() => convertElementValueToAngularForm("vf-text-input", true)).toThrow(
      TypeError,
    );
  });

  it("keeps autocomplete and select as explicit selection models", () => {
    expect(getVyrnForgeAngularFormValueModel("vf-autocomplete").kind).toBe(
      "selection",
    );
    expect(getVyrnForgeAngularFormValueModel("vf-select").kind).toBe(
      "selection",
    );
    expect(convertElementValueToAngularForm("vf-select", null)).toBeNull();
    expect(convertElementValueToAngularForm("vf-autocomplete", "ada")).toBe(
      "ada",
    );
    expect(() => convertElementValueToAngularForm("vf-select", 7)).toThrow(
      TypeError,
    );
  });

  it("maps checked models through checked and preserves mixed as null", () => {
    expect(convertAngularFormValueToElement("vf-checkbox", true)).toEqual({
      property: "checked",
      modelValue: true,
      elementValue: true,
    });
    expect(convertAngularFormValueToElement("vf-switch", null)).toEqual({
      property: "checked",
      modelValue: null,
      elementValue: false,
    });
    expect(convertElementValueToAngularForm("vf-checkbox", "mixed")).toBeNull();
    expect(convertElementValueToAngularForm("vf-switch", false)).toBe(false);
    expect(() => convertAngularFormValueToElement("vf-switch", "true")).toThrow(
      TypeError,
    );
  });

  it("adapts the string-backed number input to a numeric Angular model", () => {
    expect(convertAngularFormValueToElement("vf-number-input", 42.5)).toEqual({
      property: "value",
      modelValue: 42.5,
      elementValue: "42.5",
    });
    expect(convertAngularFormValueToElement("vf-number-input", null)).toEqual({
      property: "value",
      modelValue: null,
      elementValue: "",
    });
    expect(convertElementValueToAngularForm("vf-number-input", "42.5")).toBe(
      42.5,
    );
    expect(convertElementValueToAngularForm("vf-number-input", "")).toBeNull();
    expect(() =>
      convertElementValueToAngularForm("vf-number-input", "not-a-number"),
    ).toThrow(TypeError);
    expect(() =>
      convertAngularFormValueToElement("vf-number-input", Number.NaN),
    ).toThrow(TypeError);
  });

  it("preserves numeric rating and slider values without accepting strings", () => {
    expect(convertAngularFormValueToElement("vf-rating", 4)).toEqual({
      property: "value",
      modelValue: 4,
      elementValue: 4,
    });
    expect(convertAngularFormValueToElement("vf-slider", null)).toEqual({
      property: "value",
      modelValue: null,
      elementValue: 0,
    });
    expect(convertElementValueToAngularForm("vf-slider", 25)).toBe(25);
    expect(() => convertElementValueToAngularForm("vf-rating", "4")).toThrow(
      TypeError,
    );
    expect(() =>
      convertAngularFormValueToElement("vf-slider", Number.POSITIVE_INFINITY),
    ).toThrow(TypeError);
  });

  it("preserves collection values as frozen string arrays without coercing entries", () => {
    const source = ["alpha", "beta"];
    const write = convertAngularFormValueToElement("vf-multi-select", source);

    expect(write).toEqual({
      property: "value",
      modelValue: ["alpha", "beta"],
      elementValue: ["alpha", "beta"],
    });
    expect(write.elementValue).not.toBe(source);
    expect(Object.isFrozen(write.elementValue)).toBe(true);

    const read = convertElementValueToAngularForm("vf-transfer-list", [
      "left",
      "right",
    ]);
    expect(read).toEqual(["left", "right"]);
    expect(Object.isFrozen(read)).toBe(true);
    expect(convertAngularFormValueToElement("vf-transfer-list", null)).toEqual({
      property: "value",
      modelValue: null,
      elementValue: [],
    });
    expect(() =>
      convertAngularFormValueToElement("vf-multi-select", ["alpha", 2]),
    ).toThrow(TypeError);
    expect(() =>
      convertElementValueToAngularForm("vf-transfer-list", "left"),
    ).toThrow(TypeError);
  });

  it("rejects unsupported form control tags instead of guessing a model", () => {
    expect(() => getVyrnForgeAngularFormValueModel("vf-radio")).toThrow(
      /Unsupported form control tag/,
    );
  });
});
