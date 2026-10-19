import { describe, expect, it } from "vitest";
import {
  getDataGridFilterOperators,
  getDataGridFilterOperatorsForColumn,
  normalizeDataGridFilterOperator,
  sanitizeDataGridFilters,
} from "./filterOperators";

describe("filterOperators", () => {
  it("uses text operators for string and custom columns", () => {
    expect(getDataGridFilterOperators("string")).toEqual([
      "contains",
      "equals",
      "notEquals",
      "startsWith",
      "endsWith",
      "isEmpty",
      "isNotEmpty",
    ]);
    expect(getDataGridFilterOperators("custom")).toEqual(
      getDataGridFilterOperators("string"),
    );
  });

  it("uses comparable operators for numeric and temporal columns", () => {
    const comparable = [
      "equals",
      "notEquals",
      "gt",
      "gte",
      "lt",
      "lte",
      "isEmpty",
      "isNotEmpty",
    ];

    expect(getDataGridFilterOperators("number")).toEqual(comparable);
    expect(getDataGridFilterOperators("date")).toEqual(comparable);
    expect(getDataGridFilterOperators("datetime")).toEqual(comparable);
  });

  it("uses choice operators for boolean, enum, and status columns", () => {
    const choice = ["equals", "notEquals", "isEmpty", "isNotEmpty"];

    expect(getDataGridFilterOperators("boolean")).toEqual(choice);
    expect(getDataGridFilterOperators("enum")).toEqual(choice);
    expect(getDataGridFilterOperators("status")).toEqual(choice);
  });

  it("returns no operators for explicitly non-filterable columns", () => {
    expect(
      getDataGridFilterOperatorsForColumn({
        dataType: "string",
        filterable: false,
      }),
    ).toEqual([]);
  });

  it("defaults unspecified filterable column types to text semantics", () => {
    expect(getDataGridFilterOperatorsForColumn({})).toEqual(
      getDataGridFilterOperators("string"),
    );
  });

  it("normalizes compatibility aliases to canonical comparable operators", () => {
    expect(normalizeDataGridFilterOperator("greaterThan")).toBe("gt");
    expect(normalizeDataGridFilterOperator("greaterThanOrEqual")).toBe("gte");
    expect(normalizeDataGridFilterOperator("lessThan")).toBe("lt");
    expect(normalizeDataGridFilterOperator("lessThanOrEqual")).toBe("lte");
    expect(normalizeDataGridFilterOperator("contains")).toBe("contains");
  });

  it("sanitizes unknown, non-filterable, and incompatible draft filters", () => {
    const filters = sanitizeDataGridFilters(
      [
        { id: "name", dataType: "string" },
        { id: "score", dataType: "number" },
        { id: "private", dataType: "string", filterable: false },
      ],
      [
        {
          id: "name-filter",
          columnId: "name",
          operator: "contains",
          value: "al",
        },
        {
          id: "score-filter",
          columnId: "score",
          operator: "greaterThanOrEqual",
          value: 50,
        },
        {
          id: "bad-number-filter",
          columnId: "score",
          operator: "startsWith",
          value: "5",
        },
        {
          id: "private-filter",
          columnId: "private",
          operator: "equals",
          value: "secret",
        },
        {
          id: "missing-filter",
          columnId: "missing",
          operator: "equals",
          value: "x",
        },
      ],
    );

    expect(filters).toEqual([
      {
        id: "name-filter",
        columnId: "name",
        operator: "contains",
        value: "al",
      },
      {
        id: "score-filter",
        columnId: "score",
        operator: "gte",
        value: 50,
      },
    ]);
  });

  it("preserves multiple valid conditions for the same column", () => {
    expect(
      sanitizeDataGridFilters(
        [{ id: "score", dataType: "number" }],
        [
          { id: "min", columnId: "score", operator: "gte", value: 10 },
          { id: "max", columnId: "score", operator: "lte", value: 20 },
        ],
      ),
    ).toHaveLength(2);
  });
});
