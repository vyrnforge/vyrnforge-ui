import { describe, expect, it } from "vitest";
import {
  getDataGridFilterOperators,
  getDataGridFilterOperatorsForColumn,
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
});
