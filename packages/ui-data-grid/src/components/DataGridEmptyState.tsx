export type DataGridEmptyStateProps = {
  message?: string;
  columnCount?: number;
};

export function DataGridEmptyState({
  message = "No rows found.",
  columnCount = 1
}: DataGridEmptyStateProps) {
  return (
    <tr>
      <td className="udg-empty" colSpan={columnCount}>
        {message}
      </td>
    </tr>
  );
}
