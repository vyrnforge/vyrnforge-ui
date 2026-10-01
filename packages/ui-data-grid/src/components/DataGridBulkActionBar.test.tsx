import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import {
  DataGridBulkActionBar,
  type DataGridBulkAction,
  type DataGridState,
} from "../index";
import { createGridState } from "../state";

type Row = { id: number; name: string };

const state: DataGridState = createGridState({ selectedRowIds: [1, 2] });
const selectedRows: Row[] = [
  { id: 1, name: "Ada" },
  { id: 2, name: "Grace" },
];

describe("DataGridBulkActionBar", () => {
  it("renders nothing without selected rows", () => {
    expect(
      renderToStaticMarkup(
        <DataGridBulkActionBar
          tableId="users"
          selectedRowIds={[]}
          selectedRows={[]}
          state={createGridState()}
          onClearSelection={() => undefined}
        />,
      ),
    ).toBe("");
  });

  it("renders selection summary and visible actions through the package root", () => {
    const actions: DataGridBulkAction<Row>[] = [
      {
        id: "review",
        label: "Flag review",
        variant: "primary",
        onClick: () => undefined,
      },
      {
        id: "hidden",
        label: "Hidden action",
        hidden: ({ selectedRowIds }) => selectedRowIds.length > 0,
        onClick: () => undefined,
      },
      {
        id: "disabled",
        label: "Disabled action",
        disabled: ({ selectedRows }) => selectedRows.length === 2,
        onClick: () => undefined,
      },
    ];

    const markup = renderToStaticMarkup(
      <DataGridBulkActionBar
        tableId="users"
        selectedRowIds={[1, 2]}
        selectedRows={selectedRows}
        state={state}
        actions={actions}
        onClearSelection={() => undefined}
      />,
    );

    expect(markup).toContain("2");
    expect(markup).toContain("rows selected");
    expect(markup).toContain("Flag review");
    expect(markup).toContain("Disabled action");
    expect(markup).toContain("disabled");
    expect(markup).not.toContain("Hidden action");
    expect(markup).toContain('aria-label="Clear selected rows"');
  });

  it("passes the existing context contract to action predicates", () => {
    const hidden = vi.fn(() => false);
    const disabled = vi.fn(() => false);

    renderToStaticMarkup(
      <DataGridBulkActionBar
        tableId="users"
        selectedRowIds={[1, 2]}
        selectedRows={selectedRows}
        state={state}
        actions={[
          {
            id: "inspect",
            label: "Inspect",
            hidden,
            disabled,
            onClick: () => undefined,
          },
        ]}
        onClearSelection={() => undefined}
      />,
    );

    expect(hidden).toHaveBeenCalledWith(
      expect.objectContaining({
        tableId: "users",
        selectedRowIds: [1, 2],
        selectedRows,
        selectionScope: "page",
        state,
      }),
    );
    expect(disabled).toHaveBeenCalledWith(
      expect.objectContaining({
        tableId: "users",
        selectionScope: "page",
      }),
    );
  });
});
