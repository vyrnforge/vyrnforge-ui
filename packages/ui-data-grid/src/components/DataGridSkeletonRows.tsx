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
        <tr className="udg-skeleton-row" key={index}>
          <td colSpan={columnCount}>
            <span className="udg-skeleton-line" />
          </td>
        </tr>
      ))}
    </>
  );
}
