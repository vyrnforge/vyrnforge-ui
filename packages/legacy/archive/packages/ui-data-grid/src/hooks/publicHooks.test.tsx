import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import {
  DataGridBulkActionBar,
  createGridState,
  useDataGridState,
  type DataGridBulkActionBarProps,
  type DataGridBulkActionContext,
  type UseDataGridStateOptions,
  type UseDataGridStateResult,
} from "../index";

function StateSnapshot(options: UseDataGridStateOptions) {
  const [state]: UseDataGridStateResult = useDataGridState(options);

  return (
    <output>{`${state.search}|${state.density}|${state.pagination.pageSize}`}</output>
  );
}

describe("public data-grid exports", () => {
  it("exposes DataGridBulkActionBar and its public props contract", () => {
    type Row = { id: number; name: string };
    const context: DataGridBulkActionContext<Row> = {
      tableId: "users",
      selectedRowIds: [1],
      selectedRows: [{ id: 1, name: "Ada" }],
      selectionScope: "page",
      state: createGridState({ selectedRowIds: [1] }),
    };
    const props: DataGridBulkActionBarProps<Row> = {
      actions: [
        {
          id: "review",
          label: "Flag review",
          onClick: () => undefined,
        },
      ],
      context,
      onClearSelection: () => undefined,
    };

    const markup = renderToStaticMarkup(<DataGridBulkActionBar {...props} />);

    expect(markup).toContain("1");
    expect(markup).toContain("row selected");
    expect(markup).toContain("Flag review");
    expect(markup).toContain('aria-label="Clear selected rows"');
  });

  it("keeps the public bulk action bar empty when no rows are selected", () => {
    expect(
      renderToStaticMarkup(
        <DataGridBulkActionBar
          actions={[]}
          context={{
            tableId: "users",
            selectedRowIds: [],
            selectedRows: [],
            selectionScope: "page",
            state: createGridState(),
          }}
          onClearSelection={() => undefined}
        />,
      ),
    ).toBe("");
  });
  it("exposes the experimental hook through the package root with normalized uncontrolled state", () => {
    expect(
      renderToStaticMarkup(
        <StateSnapshot
          defaultState={{
            search: "accounts",
            density: "compact",
            pagination: { pageIndex: 0, pageSize: 50 },
          }}
        />,
      ),
    ).toBe("<output>accounts|compact|50</output>");
  });

  it("uses supplied controlled state instead of the uncontrolled default", () => {
    expect(
      renderToStaticMarkup(
        <StateSnapshot
          state={{
            search: "controlled",
            density: "comfortable",
            pagination: { pageIndex: 2, pageSize: 10 },
          }}
          defaultState={{ search: "ignored", density: "compact" }}
        />,
      ),
    ).toBe("<output>controlled|comfortable|10</output>");
  });

  it("does not expose internal coordination hooks from the package root", async () => {
    const publicApi = await import("../index");

    expect(publicApi).not.toHaveProperty("useColumnResize");
    expect(publicApi).not.toHaveProperty("useColumnReorder");
    expect(publicApi).not.toHaveProperty("useControlledState");
    expect(publicApi).not.toHaveProperty("useDebouncedValue");
  });
});
