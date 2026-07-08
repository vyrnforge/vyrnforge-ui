import { EmptyState } from "@dravyn/ui-components";

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
        <EmptyState
          className="udg-state udg-state-empty"
          description={resolvedMessage}
          title={title}
        />
      </td>
    </tr>
  );
}
