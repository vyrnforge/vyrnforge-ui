import { DataGridIcon } from "./DataGridIcon";

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
  const title = hasQuery ? "No matching results" : "No data";

  return (
    <tr>
      <td className="udg-empty" colSpan={columnCount}>
        <div className="udg-state udg-state-empty">
          <span className="udg-state-icon" aria-hidden="true">
            <DataGridIcon name="empty" />
          </span>
          <strong>{title}</strong>
          <span>{resolvedMessage}</span>
        </div>
      </td>
    </tr>
  );
}
