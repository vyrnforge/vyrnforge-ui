export type VyrnForgeAngularFormControlTag =
  | "vf-autocomplete"
  | "vf-checkbox"
  | "vf-date-input"
  | "vf-datetime-input"
  | "vf-multi-select"
  | "vf-number-input"
  | "vf-rating"
  | "vf-search-input"
  | "vf-select"
  | "vf-slider"
  | "vf-switch"
  | "vf-text-input"
  | "vf-textarea"
  | "vf-transfer-list";

export type VyrnForgeAngularFormModelKind =
  | "value"
  | "checked"
  | "numeric"
  | "collection"
  | "selection";

export type VyrnForgeAngularFormValue =
  | boolean
  | number
  | readonly string[]
  | string
  | null;

export type VyrnForgeAngularFormModelProperty = "checked" | "value";
export type VyrnForgeAngularFormModelEvent =
  | "vf-checked-change"
  | "vf-value-change";

export interface VyrnForgeAngularFormValueModel {
  readonly tagName: VyrnForgeAngularFormControlTag;
  readonly kind: VyrnForgeAngularFormModelKind;
  readonly property: VyrnForgeAngularFormModelProperty;
  readonly eventName: VyrnForgeAngularFormModelEvent;
}

export interface VyrnForgeAngularFormWriteValue {
  readonly property: VyrnForgeAngularFormModelProperty;
  readonly modelValue: VyrnForgeAngularFormValue;
  readonly elementValue: boolean | number | readonly string[] | string;
}

export const vyrnForgeAngularFormValueModels = Object.freeze([
  {
    tagName: "vf-autocomplete",
    kind: "selection",
    property: "value",
    eventName: "vf-value-change",
  },
  {
    tagName: "vf-checkbox",
    kind: "checked",
    property: "checked",
    eventName: "vf-checked-change",
  },
  {
    tagName: "vf-date-input",
    kind: "value",
    property: "value",
    eventName: "vf-value-change",
  },
  {
    tagName: "vf-datetime-input",
    kind: "value",
    property: "value",
    eventName: "vf-value-change",
  },
  {
    tagName: "vf-multi-select",
    kind: "collection",
    property: "value",
    eventName: "vf-value-change",
  },
  {
    tagName: "vf-number-input",
    kind: "numeric",
    property: "value",
    eventName: "vf-value-change",
  },
  {
    tagName: "vf-rating",
    kind: "numeric",
    property: "value",
    eventName: "vf-value-change",
  },
  {
    tagName: "vf-search-input",
    kind: "value",
    property: "value",
    eventName: "vf-value-change",
  },
  {
    tagName: "vf-select",
    kind: "selection",
    property: "value",
    eventName: "vf-value-change",
  },
  {
    tagName: "vf-slider",
    kind: "numeric",
    property: "value",
    eventName: "vf-value-change",
  },
  {
    tagName: "vf-switch",
    kind: "checked",
    property: "checked",
    eventName: "vf-checked-change",
  },
  {
    tagName: "vf-text-input",
    kind: "value",
    property: "value",
    eventName: "vf-value-change",
  },
  {
    tagName: "vf-textarea",
    kind: "value",
    property: "value",
    eventName: "vf-value-change",
  },
  {
    tagName: "vf-transfer-list",
    kind: "collection",
    property: "value",
    eventName: "vf-value-change",
  },
] satisfies readonly VyrnForgeAngularFormValueModel[]);

const valueModelByTagName = new Map(
  vyrnForgeAngularFormValueModels.map((model) => [model.tagName, model]),
);

export function getVyrnForgeAngularFormValueModel(
  tagName: string,
): VyrnForgeAngularFormValueModel {
  const model = valueModelByTagName.get(
    tagName as VyrnForgeAngularFormControlTag,
  );
  if (!model) {
    throw new TypeError(
      `[VyrnForge Angular Forms] Unsupported form control tag: ${tagName}`,
    );
  }
  return model;
}

export function convertAngularFormValueToElement(
  tagName: string,
  value: unknown,
): VyrnForgeAngularFormWriteValue {
  const model = getVyrnForgeAngularFormValueModel(tagName);

  switch (model.kind) {
    case "value":
    case "selection": {
      if (value == null) {
        return {
          property: model.property,
          modelValue: null,
          elementValue: "",
        };
      }
      assertString(tagName, value, "Angular model value");
      return {
        property: model.property,
        modelValue: value,
        elementValue: value,
      };
    }
    case "checked": {
      if (value == null) {
        return {
          property: model.property,
          modelValue: null,
          elementValue: false,
        };
      }
      assertBoolean(tagName, value, "Angular model value");
      return {
        property: model.property,
        modelValue: value,
        elementValue: value,
      };
    }
    case "numeric": {
      if (value == null) {
        return {
          property: model.property,
          modelValue: null,
          elementValue: tagName === "vf-number-input" ? "" : 0,
        };
      }
      assertFiniteNumber(tagName, value, "Angular model value");
      return {
        property: model.property,
        modelValue: value,
        elementValue: tagName === "vf-number-input" ? String(value) : value,
      };
    }
    case "collection": {
      if (value == null) {
        return {
          property: model.property,
          modelValue: null,
          elementValue: Object.freeze([]),
        };
      }
      const entries = cloneStringArray(tagName, value, "Angular model value");
      return {
        property: model.property,
        modelValue: entries,
        elementValue: entries,
      };
    }
  }
}

export function convertElementValueToAngularForm(
  tagName: string,
  value: unknown,
): VyrnForgeAngularFormValue {
  const model = getVyrnForgeAngularFormValueModel(tagName);

  switch (model.kind) {
    case "value":
      assertString(tagName, value, "native value");
      return value;
    case "selection":
      if (value === null) return null;
      assertString(tagName, value, "native selection value");
      return value;
    case "checked":
      if (value === "mixed") return null;
      assertBoolean(tagName, value, "native checked value");
      return value;
    case "numeric":
      if (tagName === "vf-number-input") {
        if (value === "") return null;
        assertString(tagName, value, "native numeric value");
        if (value.trim() !== value || value.length === 0) {
          throw conversionError(tagName, "finite numeric string", value);
        }
        const numericValue = Number(value);
        if (!Number.isFinite(numericValue)) {
          throw conversionError(tagName, "finite numeric string", value);
        }
        return numericValue;
      }
      assertFiniteNumber(tagName, value, "native numeric value");
      return value;
    case "collection":
      return cloneStringArray(tagName, value, "native collection value");
  }
}

function assertString(
  tagName: string,
  value: unknown,
  expected: string,
): asserts value is string {
  if (typeof value !== "string") throw conversionError(tagName, expected, value);
}

function assertBoolean(
  tagName: string,
  value: unknown,
  expected: string,
): asserts value is boolean {
  if (typeof value !== "boolean") {
    throw conversionError(tagName, expected, value);
  }
}

function assertFiniteNumber(
  tagName: string,
  value: unknown,
  expected: string,
): asserts value is number {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw conversionError(tagName, expected, value);
  }
}

function cloneStringArray(
  tagName: string,
  value: unknown,
  expected: string,
): readonly string[] {
  if (
    !Array.isArray(value) ||
    !value.every((entry) => typeof entry === "string")
  ) {
    throw conversionError(tagName, `${expected} as readonly string[]`, value);
  }
  return Object.freeze([...value]);
}

function conversionError(
  tagName: string,
  expected: string,
  value: unknown,
): TypeError {
  return new TypeError(
    `[VyrnForge Angular Forms] ${tagName} expected ${expected}; received ${describeValue(value)}.`,
  );
}

function describeValue(value: unknown): string {
  if (value === null) return "null";
  if (Array.isArray(value)) return "array";
  if (typeof value === "number" && !Number.isFinite(value)) {
    return String(value);
  }
  return typeof value;
}
