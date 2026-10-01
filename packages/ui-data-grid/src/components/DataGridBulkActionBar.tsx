import { Badge, Button, Icon, IconButton } from "@vyrnforge/ui-components";
import type {
  DataGridBulkAction,
  DataGridBulkActionContext,
  DataGridRowId,
  DataGridSelectionScope,
  DataGridState,
} from "../types/dataGrid.types";

export type DataGridBulkActionBarProps<
  RowData extends Record<string, unknown> = Record<string, unknown>,
> = {
  tableId: string;
  selectedRowIds: DataGridRowId[];
  selectedRows: RowData[];
  state: DataGridState;
  actions?: DataGridBulkAction<RowData>[];
  selectionScope?: DataGridSelectionScope;
  onClearSelection: () => void;
};

export function DataGridBulkActionBar<
  RowData extends Record<string, unknown> = Record<string, unknown>,
>({
  tableId,
  selectedRowIds,
  selectedRows,
  state,
  actions = [],
  selectionScope = "page",
  onClearSelection,
}: DataGridBulkActionBarProps<RowData>) {
  if (selectedRowIds.length === 0) {
    return null;
  }

  const context: DataGridBulkActionContext<RowData> = {
    tableId,
    selectedRowIds,
    selectedRows,
    selectionScope,
    state,
  };
  const visibleActions = actions.filter((action) => {
    const hidden =
      typeof action.hidden === "function"
        ? action.hidden(context)
        : action.hidden;

    return !hidden;
  });

  return (
    <div className="udg-bulk-action-bar" role="status">
      <div className="udg-bulk-action-bar__summary">
        <Badge size="sm" variant="info">
          {selectedRowIds.length}
        </Badge>
        <span>
          row{selectedRowIds.length === 1 ? "" : "s"} selected
        </span>
      </div>
      <div className="udg-bulk-action-bar__actions">
        {visibleActions.map((action) => {
          const disabled =
            typeof action.disabled === "function"
              ? action.disabled(context)
              : action.disabled;

          return (
            <Button
              className={[
                "udg-bulk-action",
                action.variant ? `udg-bulk-action--${action.variant}` : "",
              ]
                .filter(Boolean)
                .join(" ")}
              disabled={disabled}
              key={action.id}
              size="sm"
              type="button"
              variant={action.variant ?? "default"}
              onClick={() => action.onClick(context)}
            >
              {action.label}
            </Button>
          );
        })}
        <IconButton
          aria-label="Clear selected rows"
          className="udg-bulk-action udg-bulk-action--clear"
          size="sm"
          tooltip="Clear selection"
          type="button"
          variant="subtle"
          onClick={onClearSelection}
        >
          <Icon name="Close" size="xs" />
        </IconButton>
      </div>
    </div>
  );
}
