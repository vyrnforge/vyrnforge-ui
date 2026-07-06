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
        <strong>Unable to load data.</strong>
        <span>{message}</span>
      </td>
    </tr>
  );
}
