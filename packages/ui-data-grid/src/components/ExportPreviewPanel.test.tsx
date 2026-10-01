import { Children, isValidElement, type ReactElement, type ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import type { DataGridExportPreview } from "../core/exportPreview";
import { ExportPreviewPanel } from "./ExportPreviewPanel";

const preview: DataGridExportPreview = {
  tableId: "orders",
  format: "xlsx",
  scope: "selected_rows",
  visibleColumns: [
    { id: "id", header: "ID", visible: true },
    { id: "status", header: "Status", visible: true },
  ],
  hiddenColumnCount: 1,
  filterCount: 1,
  hasSearch: true,
  sortCount: 1,
  groupingCount: 1,
  selectedRowCount: 2,
  pagination: { pageIndex: 2, pageSize: 25 },
};

type InteractiveElementProps = {
  children?: ReactNode;
  onClick?: () => void;
};

function findElementByText(
  node: ReactNode,
  text: string,
): ReactElement<InteractiveElementProps> | null {
  if (!isValidElement<InteractiveElementProps>(node)) {
    return null;
  }

  if (node.props.children === text) {
    return node;
  }

  for (const child of Children.toArray(node.props.children)) {
    const match = findElementByText(child, text);

    if (match) {
      return match;
    }
  }

  return null;
}

describe("ExportPreviewPanel", () => {
  it("renders the canonical preview summary without export lifecycle state", () => {
    const markup = renderToStaticMarkup(
      <ExportPreviewPanel
        preview={preview}
        onCancel={() => undefined}
        onConfirm={() => undefined}
      />,
    );

    expect(markup).toContain("Export preview");
    expect(markup).toContain("XLSX");
    expect(markup).toContain("Selected rows");
    expect(markup).toContain("2 selected rows");
    expect(markup).toContain("Page 3, 25 rows per page");
    expect(markup).toContain("2 visible columns");
    expect(markup).toContain("1 hidden column");
    expect(markup).toContain(">ID<");
    expect(markup).toContain(">Status<");
    expect(markup).toContain("Search: Active");
    expect(markup).toContain("1 active filter");
    expect(markup).toContain("1 active sort");
    expect(markup).toContain("1 active group");
    expect(markup).not.toContain("download");
    expect(markup).not.toContain("job");
  });

  it.each([
    ["current_page", "Current page"],
    ["selected_rows", "Selected rows"],
    ["filtered_rows", "Filtered rows"],
    ["all_rows", "All rows"],
  ] as const)("renders %s with an explicit scope label", (scope, label) => {
    const markup = renderToStaticMarkup(
      <ExportPreviewPanel
        preview={{ ...preview, scope }}
        onCancel={() => undefined}
        onConfirm={() => undefined}
      />,
    );

    expect(markup).toContain(label);
  });

  it("makes empty query, column, and selection state explicit", () => {
    const markup = renderToStaticMarkup(
      <ExportPreviewPanel
        preview={{
          ...preview,
          visibleColumns: [],
          hiddenColumnCount: 0,
          filterCount: 0,
          hasSearch: false,
          sortCount: 0,
          groupingCount: 0,
          selectedRowCount: 0,
        }}
        onCancel={() => undefined}
        onConfirm={() => undefined}
      />,
    );

    expect(markup).toContain("No visible columns");
    expect(markup).toContain("0 hidden columns");
    expect(markup).toContain("0 selected rows");
    expect(markup).toContain(
      "No active search, filters, sorting, or grouping",
    );
  });

  it("forwards confirm and cancel as presentation callbacks only", () => {
    const onConfirm = vi.fn();
    const onCancel = vi.fn();
    const tree = ExportPreviewPanel({ preview, onConfirm, onCancel });

    findElementByText(tree, "Confirm export")?.props.onClick?.();
    findElementByText(tree, "Cancel")?.props.onClick?.();

    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(preview).toEqual({
      tableId: "orders",
      format: "xlsx",
      scope: "selected_rows",
      visibleColumns: [
        { id: "id", header: "ID", visible: true },
        { id: "status", header: "Status", visible: true },
      ],
      hiddenColumnCount: 1,
      filterCount: 1,
      hasSearch: true,
      sortCount: 1,
      groupingCount: 1,
      selectedRowCount: 2,
      pagination: { pageIndex: 2, pageSize: 25 },
    });
  });

  it("remains internal to the package", async () => {
    const publicApi = await import("../index");

    expect(publicApi).not.toHaveProperty("ExportPreviewPanel");
  });
});
