import type { DataGridPaginationState } from "../types/dataGrid.types";
import { DataGridIcon } from "./DataGridIcon";

export type DataGridPaginationProps = {
  pagination: DataGridPaginationState;
  totalRows: number;
  onChange: (pagination: DataGridPaginationState) => void;
  pageSizeOptions?: number[];
};

export function DataGridPagination({
  pagination,
  totalRows,
  onChange,
  pageSizeOptions = [10, 25, 50, 100]
}: DataGridPaginationProps) {
  const pageCount = Math.max(1, Math.ceil(totalRows / pagination.pageSize));
  const currentPage = Math.min(pagination.pageIndex + 1, pageCount);
  const startRow = totalRows === 0 ? 0 : pagination.pageIndex * pagination.pageSize + 1;
  const endRow = Math.min(totalRows, (pagination.pageIndex + 1) * pagination.pageSize);

  return (
    <div className="udg-pagination" aria-label="Pagination">
      <span className="udg-pagination-count">
        {startRow}-{endRow} of {totalRows} rows
      </span>
      <label className="udg-page-size">
        Rows per page
        <select
          className="udg-page-size-select"
          value={pagination.pageSize}
          onChange={(event) =>
            onChange({
              pageIndex: 0,
              pageSize: Number(event.currentTarget.value)
            })
          }
        >
          {pageSizeOptions.map((pageSize) => (
            <option key={pageSize} value={pageSize}>
              {pageSize}
            </option>
          ))}
        </select>
      </label>
      <span className="udg-page-status">Page {currentPage} of {pageCount}</span>
      <div className="udg-pagination-actions">
        <button
          aria-label="Go to previous page"
          className="udg-pagination-button"
          type="button"
          onClick={() =>
            onChange({
              ...pagination,
              pageIndex: Math.max(0, pagination.pageIndex - 1)
            })
          }
          disabled={pagination.pageIndex <= 0}
        >
          <DataGridIcon name="chevronLeft" />
          <span>Previous</span>
        </button>
        <button
          aria-label="Go to next page"
          className="udg-pagination-button"
          type="button"
          onClick={() =>
            onChange({
              ...pagination,
              pageIndex: Math.min(pageCount - 1, pagination.pageIndex + 1)
            })
          }
          disabled={pagination.pageIndex >= pageCount - 1}
        >
          <span>Next</span>
          <DataGridIcon name="chevronRight" />
        </button>
      </div>
    </div>
  );
}
