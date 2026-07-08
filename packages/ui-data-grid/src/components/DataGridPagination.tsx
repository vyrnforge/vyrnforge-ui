import { Button, Icon, Select } from "@dravyn/ui-components";
import type { DataGridPaginationState } from "../types/dataGrid.types";

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
  const pageSizeSelectOptions = pageSizeOptions.map((pageSize) => ({
    label: String(pageSize),
    value: String(pageSize)
  }));

  return (
    <div className="udg-pagination" aria-label="Pagination">
      <span className="udg-pagination-count">
        {startRow}-{endRow} of {totalRows} rows
      </span>
      <label className="udg-page-size">
        Rows per page
        <Select
          className="udg-page-size-select"
          options={pageSizeSelectOptions}
          size="sm"
          value={pagination.pageSize}
          onChange={(event) =>
            onChange({
              pageIndex: 0,
              pageSize: Number(event.currentTarget.value)
            })
          }
        />
      </label>
      <span className="udg-page-status">Page {currentPage} of {pageCount}</span>
      <div className="udg-pagination-actions">
        <Button
          aria-label="Go to previous page"
          className="udg-pagination-button"
          leadingIcon={<Icon name="ChevronLeft" size="xs" />}
          size="sm"
          onClick={() =>
            onChange({
              ...pagination,
              pageIndex: Math.max(0, pagination.pageIndex - 1)
            })
          }
          disabled={pagination.pageIndex <= 0}
        >
          Previous
        </Button>
        <Button
          aria-label="Go to next page"
          className="udg-pagination-button"
          size="sm"
          trailingIcon={<Icon name="ChevronRight" size="xs" />}
          onClick={() =>
            onChange({
              ...pagination,
              pageIndex: Math.min(pageCount - 1, pagination.pageIndex + 1)
            })
          }
          disabled={pagination.pageIndex >= pageCount - 1}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
