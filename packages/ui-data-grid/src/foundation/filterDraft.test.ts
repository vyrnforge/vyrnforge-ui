import { describe, expect, it } from "vitest";

import {
  applyDataGridFilterDraft,
  cancelDataGridFilterDraft,
  clearDataGridFilterDraft,
  createDataGridFilterDraftSession,
  resetDataGridFilterDraft,
  setDataGridFilterDraft,
} from "./filterDraft";
import type { DataGridFilter, DataGridFoundationColumnDef } from "./types";

type Row = {
  id: number;
  name: string;
  age: number;
};

const columns: DataGridFoundationColumnDef<Row>[] = [
  { id: "name", accessorKey: "name", dataType: "string", filterable: true },
  { id: "age", accessorKey: "age", dataType: "number", filterable: true },
  { id: "id", accessorKey: "id", dataType: "number", filterable: false },
];

const applied: DataGridFilter[] = [
  { id: "name-filter", columnId: "name", operator: "contains", value: "Ada" },
];

describe("data-grid filter draft session", () => {
  it("starts from a sanitized copy of applied filters", () => {
    const source: DataGridFilter[] = [
      ...applied,
      {
        id: "legacy-age",
        columnId: "age",
        operator: "greaterThanOrEqual",
        value: 18,
      },
      {
        id: "unknown",
        columnId: "missing",
        operator: "equals",
        value: "ignored",
      },
    ];

    const session = createDataGridFilterDraftSession(columns, source);

    expect(session).toEqual({
      appliedFilters: [
        applied[0],
        {
          id: "legacy-age",
          columnId: "age",
          operator: "gte",
          value: 18,
        },
      ],
      draftFilters: [
        applied[0],
        {
          id: "legacy-age",
          columnId: "age",
          operator: "gte",
          value: 18,
        },
      ],
    });
    expect(session.appliedFilters).not.toBe(source);
    expect(session.draftFilters).not.toBe(session.appliedFilters);
  });

  it("edits the draft without mutating applied filters", () => {
    const session = createDataGridFilterDraftSession(columns, applied);
    const nextDraft: DataGridFilter[] = [
      { id: "age-filter", columnId: "age", operator: "gt", value: 21 },
    ];

    const next = setDataGridFilterDraft(session, columns, nextDraft);

    expect(next.appliedFilters).toEqual(applied);
    expect(next.draftFilters).toEqual(nextDraft);
    expect(session.draftFilters).toEqual(applied);
  });

  it("clear empties only the draft until Apply", () => {
    const session = createDataGridFilterDraftSession(columns, applied);
    const cleared = clearDataGridFilterDraft(session);

    expect(cleared.appliedFilters).toEqual(applied);
    expect(cleared.draftFilters).toEqual([]);
  });

  it("reset and cancel discard unsaved edits back to applied filters", () => {
    const session = setDataGridFilterDraft(
      createDataGridFilterDraftSession(columns, applied),
      columns,
      [{ id: "age-filter", columnId: "age", operator: "gt", value: 30 }],
    );

    expect(resetDataGridFilterDraft(session)).toEqual({
      appliedFilters: applied,
      draftFilters: applied,
    });
    expect(cancelDataGridFilterDraft(session)).toEqual({
      appliedFilters: applied,
      draftFilters: applied,
    });
  });

  it("Apply sanitizes the draft and makes it the new applied state", () => {
    const session = {
      appliedFilters: applied,
      draftFilters: [
        {
          id: "age-min",
          columnId: "age",
          operator: "greaterThan",
          value: 18,
        },
        {
          id: "age-max",
          columnId: "age",
          operator: "lessThanOrEqual",
          value: 65,
        },
        {
          id: "blocked",
          columnId: "id",
          operator: "equals",
          value: 1,
        },
      ] satisfies DataGridFilter[],
    };

    const next = applyDataGridFilterDraft(session, columns);

    expect(next).toEqual({
      appliedFilters: [
        { id: "age-min", columnId: "age", operator: "gt", value: 18 },
        { id: "age-max", columnId: "age", operator: "lte", value: 65 },
      ],
      draftFilters: [
        { id: "age-min", columnId: "age", operator: "gt", value: 18 },
        { id: "age-max", columnId: "age", operator: "lte", value: 65 },
      ],
    });
  });

  it("preserves multiple valid conditions for the same column", () => {
    const session = createDataGridFilterDraftSession(columns, []);
    const next = setDataGridFilterDraft(session, columns, [
      { id: "minimum", columnId: "age", operator: "gte", value: 18 },
      { id: "maximum", columnId: "age", operator: "lte", value: 65 },
    ]);

    expect(next.draftFilters.map((filter) => filter.id)).toEqual([
      "minimum",
      "maximum",
    ]);
  });
});
