import type { DataGridPaginationState } from "../types/dataGrid.types";

export type DataGridPaginationProps = {
  pagination: DataGridPaginationState;
  totalRows: number;
  onChange: (pagination: DataGridPaginationState) => void;
};

export function DataGridPagination({
  pagination,
  totalRows,
  onChange
}: DataGridPaginationProps) {
  const pageCount = Math.max(1, Math.ceil(totalRows / pagination.pageSize));
  const currentPage = Math.min(pagination.pageIndex + 1, pageCount);

  return (
    <div className="udg-pagination">
      <span>
        Page {currentPage} of {pageCount}
      </span>
      <div className="udg-pagination-actions">
        <button
          type="button"
          onClick={() =>
            onChange({
              ...pagination,
              pageIndex: Math.max(0, pagination.pageIndex - 1)
            })
          }
          disabled={pagination.pageIndex <= 0}
        >
          Previous
        </button>
        <button
          type="button"
          onClick={() =>
            onChange({
              ...pagination,
              pageIndex: Math.min(pageCount - 1, pagination.pageIndex + 1)
            })
          }
          disabled={pagination.pageIndex >= pageCount - 1}
        >
          Next
        </button>
      </div>
    </div>
  );
}
