import { Skeleton } from "@dravyn/ui-components";

export type DataGridSkeletonRowsProps = {
  rowCount?: number;
  columnCount?: number;
};

export function DataGridSkeletonRows({
  rowCount = 5,
  columnCount = 1
}: DataGridSkeletonRowsProps) {
  return (
    <>
      {Array.from({ length: rowCount }).map((_, index) => (
        <tr aria-hidden="true" className="udg-skeleton-row" key={index}>
          {Array.from({ length: columnCount }).map((__, columnIndex) => (
            <td key={columnIndex}>
              <Skeleton className="udg-skeleton-line" height={14} />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}
