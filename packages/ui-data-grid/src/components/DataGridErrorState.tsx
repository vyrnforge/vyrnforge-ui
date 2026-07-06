export type DataGridErrorStateProps = {
  error?: string | null;
  columnCount?: number;
};

export function DataGridErrorState({
  error,
  columnCount = 1
}: DataGridErrorStateProps) {
  if (!error) {
    return null;
  }

  return (
    <tr>
      <td className="udg-error" colSpan={columnCount} role="alert">
        {error}
      </td>
    </tr>
  );
}
