import { ErrorState } from "@vyrnforge/ui-components";

export type DataGridErrorStateProps = {
  error?: string | Error | null;
  columnCount?: number;
};

export function DataGridErrorState({
  error,
  columnCount = 1
}: DataGridErrorStateProps) {
  if (!error) {
    return null;
  }

  const message = error instanceof Error ? error.message : error;

  return (
    <tr>
      <td className="udg-error" colSpan={columnCount} role="alert">
        <ErrorState
          className="udg-state udg-state-error"
          description={message}
          title="Unable to load data."
        />
      </td>
    </tr>
  );
}
