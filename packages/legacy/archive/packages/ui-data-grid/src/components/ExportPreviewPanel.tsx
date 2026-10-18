import { Button } from "@vyrnforge/ui-components";
import type { DataGridExportPreview } from "../core/exportPreview";

export type ExportPreviewPanelProps = {
  preview: DataGridExportPreview;
  onConfirm: () => void;
  onCancel: () => void;
};

const scopeLabels = {
  current_page: "Current page",
  selected_rows: "Selected rows",
  filtered_rows: "Filtered rows",
  all_rows: "All rows",
} as const;

function countLabel(count: number, singular: string, plural = `${singular}s`) {
  return `${count} ${count === 1 ? singular : plural}`;
}

export function ExportPreviewPanel({
  preview,
  onConfirm,
  onCancel,
}: ExportPreviewPanelProps) {
  const queryActive =
    preview.hasSearch ||
    preview.filterCount > 0 ||
    preview.sortCount > 0 ||
    preview.groupingCount > 0;

  return (
    <section
      aria-label="Export preview"
      className="udg-export-preview"
      data-export-format={preview.format}
      data-export-scope={preview.scope}
    >
      <div className="udg-export-preview__header">
        <div>
          <h3 className="udg-export-preview__title">Export preview</h3>
          <p className="udg-export-preview__description">
            Review the data included in this export.
          </p>
        </div>
        <strong className="udg-export-preview__format">
          {preview.format.toUpperCase()}
        </strong>
      </div>

      <dl className="udg-export-preview__summary">
        <div>
          <dt>Scope</dt>
          <dd>{scopeLabels[preview.scope]}</dd>
        </div>
        <div>
          <dt>Selection</dt>
          <dd>{countLabel(preview.selectedRowCount, "selected row")}</dd>
        </div>
        <div>
          <dt>Pagination</dt>
          <dd>
            Page {preview.pagination.pageIndex + 1},{" "}
            {countLabel(preview.pagination.pageSize, "row")} per page
          </dd>
        </div>
      </dl>

      <section
        aria-label="Export columns"
        className="udg-export-preview__section"
      >
        <h4>Columns</h4>
        <p className="udg-export-preview__meta">
          {countLabel(preview.visibleColumns.length, "visible column")}
          {" · "}
          {countLabel(preview.hiddenColumnCount, "hidden column")}
        </p>
        {preview.visibleColumns.length > 0 ? (
          <ul className="udg-export-preview__columns">
            {preview.visibleColumns.map((column) => (
              <li key={column.id}>{column.header}</li>
            ))}
          </ul>
        ) : (
          <p className="udg-export-preview__empty">No visible columns</p>
        )}
      </section>

      <section
        aria-label="Export query"
        className="udg-export-preview__section"
      >
        <h4>Query</h4>
        {queryActive ? (
          <ul className="udg-export-preview__query">
            <li>Search: {preview.hasSearch ? "Active" : "None"}</li>
            <li>{countLabel(preview.filterCount, "active filter")}</li>
            <li>{countLabel(preview.sortCount, "active sort")}</li>
            <li>{countLabel(preview.groupingCount, "active group")}</li>
          </ul>
        ) : (
          <p className="udg-export-preview__empty">
            No active search, filters, sorting, or grouping
          </p>
        )}
      </section>

      <div className="udg-export-preview__actions">
        <Button size="sm" type="button" variant="subtle" onClick={onCancel}>
          Cancel
        </Button>
        <Button size="sm" type="button" variant="primary" onClick={onConfirm}>
          Confirm export
        </Button>
      </div>
    </section>
  );
}
