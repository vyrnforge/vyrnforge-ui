import { DataGridIcon } from "./DataGridIcon";

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
        <div className="udg-state udg-state-error">
          <span className="udg-state-icon" aria-hidden="true">
            <DataGridIcon name="alert" />
          </span>
          <strong>Unable to load data.</strong>
          <span>{message}</span>
        </div>
      </td>
    </tr>
  );
}
