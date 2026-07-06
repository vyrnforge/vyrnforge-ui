export type DataGridEmptyStateProps = {
  message?: string;
  columnCount?: number;
  hasQuery?: boolean;
};

export function DataGridEmptyState({
  message,
  columnCount = 1,
  hasQuery = false
}: DataGridEmptyStateProps) {
  const resolvedMessage =
    message ?? (hasQuery ? "No results match your search or filters." : "No data available.");

  return (
    <tr>
      <td className="udg-empty" colSpan={columnCount}>
        {resolvedMessage}
      </td>
    </tr>
  );
}
