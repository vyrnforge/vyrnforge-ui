import { Badge, Button, Icon, IconButton } from "@vyrnforge/ui-components";
import type {
  DataGridBulkAction,
  DataGridBulkActionContext,
} from "../types/dataGrid.types";

type DataGridBulkActionBarProps<
  RowData extends Record<string, unknown> = Record<string, unknown>,
> = {
  actions: DataGridBulkAction<RowData>[];
  context: DataGridBulkActionContext<RowData>;
  onClearSelection: () => void;
};

export function DataGridBulkActionBar<
  RowData extends Record<string, unknown> = Record<string, unknown>,
>({
  actions,
  context,
  onClearSelection,
}: DataGridBulkActionBarProps<RowData>) {
  const selectedCount = context.selectedRowIds.length;

  if (selectedCount === 0) {
    return null;
  }

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
          {selectedCount}
        </Badge>
        <span>
          row{selectedCount === 1 ? "" : "s"} selected
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
