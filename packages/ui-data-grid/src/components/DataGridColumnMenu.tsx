import { useMemo, useState, type DragEvent } from "react";
import {
  Badge,
  Button,
  Checkbox,
  Icon,
  IconButton,
  Menu,
  SearchInput,
  SegmentedControl,
  ToolbarButton
} from "@dravyn/ui-components";
import {
  filterColumnMenuColumns,
  resolveOrderedColumns,
  resolveVisibleColumns
} from "../core/columnManagement";
import type {
  DataGridColumnDef,
  DataGridColumnVisibilityState
} from "../types/column.types";
import type { DataGridDensity } from "../types/dataGrid.types";

export type DataGridColumnMenuProps<
  RowData extends Record<string, unknown> = Record<string, unknown>
> = {
  columns: DataGridColumnDef<RowData>[];
  columnVisibility: DataGridColumnVisibilityState;
  columnOrder: string[];
  density: DataGridDensity;
  onColumnVisibilityChange: (columnId: string, visible: boolean) => void;
  onColumnOrderChange: (columnOrder: string[]) => void;
  onMoveColumn: (
    columnId: string,
    direction: "up" | "down" | "first" | "last"
  ) => void;
  onDensityChange: (density: DataGridDensity) => void;
  onShowAllColumns: () => void;
  onHideOptionalColumns: () => void;
  onResetColumnOrder: () => void;
  onResetColumnSize: (columnId: string) => void;
  onResetColumnSizes: () => void;
  onResetColumns: () => void;
  onResetView: () => void;
};

const densityOptions: DataGridDensity[] = [
  "compact",
  "standard",
  "comfortable"
];

const densityOptionsConfig = densityOptions.map((densityOption) => ({
  value: densityOption,
  label: densityOption[0].toUpperCase() + densityOption.slice(1),
  icon: (
    <Icon
      name={
        densityOption === "compact"
          ? "Minus"
          : densityOption === "comfortable"
            ? "Plus"
            : "Settings"
      }
      size="xs"
    />
  )
}));

const moveColumnInOrder = (
  orderedColumnIds: string[],
  draggedColumnId: string,
  targetColumnId: string
) => {
  if (draggedColumnId === targetColumnId) {
    return orderedColumnIds;
  }

  const nextOrder = orderedColumnIds.filter(
    (columnId) => columnId !== draggedColumnId
  );
  const targetIndex = nextOrder.indexOf(targetColumnId);

  if (targetIndex < 0) {
    return orderedColumnIds;
  }

  nextOrder.splice(targetIndex, 0, draggedColumnId);
  return nextOrder;
};

export function DataGridColumnMenu<
  RowData extends Record<string, unknown> = Record<string, unknown>
>({
  columns,
  columnVisibility,
  columnOrder,
  density,
  onColumnVisibilityChange,
  onColumnOrderChange,
  onMoveColumn,
  onDensityChange,
  onShowAllColumns,
  onHideOptionalColumns,
  onResetColumnOrder,
  onResetColumnSize,
  onResetColumnSizes,
  onResetColumns,
  onResetView
}: DataGridColumnMenuProps<RowData>) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [draggedColumnId, setDraggedColumnId] = useState<string | null>(null);
  const [dropColumnId, setDropColumnId] = useState<string | null>(null);
  const orderedColumns = useMemo(
    () => resolveOrderedColumns(columns, columnOrder),
    [columnOrder, columns]
  );
  const filteredColumns = useMemo(
    () => filterColumnMenuColumns(orderedColumns, search),
    [orderedColumns, search]
  );
  const visibleColumnIds = useMemo(
    () =>
      new Set(
        resolveVisibleColumns(columns, columnVisibility).map((column) => column.id)
      ),
    [columnVisibility, columns]
  );
  const orderedColumnIds = useMemo(
    () => orderedColumns.map((column) => column.id),
    [orderedColumns]
  );

  const handleDrop = (
    event: DragEvent<HTMLDivElement>,
    targetColumnId: string
  ) => {
    event.preventDefault();

    if (!draggedColumnId) {
      return;
    }

    onColumnOrderChange(
      moveColumnInOrder(orderedColumnIds, draggedColumnId, targetColumnId)
    );
    setDraggedColumnId(null);
    setDropColumnId(null);
  };

  return (
    <div className="udg-column-menu">
      <ToolbarButton
        aria-expanded={open}
        className="udg-toolbar-button"
        icon={<Icon name="Columns" size="xs" />}
        label="Columns"
        size="sm"
        tooltip="Column settings"
        type="button"
        onClick={() => setOpen((currentOpen) => !currentOpen)}
      />

      {open && (
        <div
          className="udg-column-menu-panel"
          role="dialog"
          aria-label="Column settings"
        >
          <div className="udg-column-menu__header">
            <strong>Columns</strong>
            <IconButton
              aria-label="Close column settings"
              className="udg-icon-button"
              size="xs"
              tooltip="Close"
              type="button"
              variant="ghost"
              onClick={() => setOpen(false)}
            >
              <Icon name="Close" size="xs" />
            </IconButton>
          </div>

          <SearchInput
            aria-label="Search columns"
            className="udg-column-menu__search-input"
            placeholder="Search columns"
            size="sm"
            value={search}
            wrapperClassName="udg-column-menu__search"
            onChange={(event) => setSearch(event.currentTarget.value)}
          />

          <SegmentedControl
            aria-label="Density"
            className="udg-column-menu__density udg-segmented-control"
            options={densityOptionsConfig.map((option) => ({
              ...option,
              label: option.label
            }))}
            size="sm"
            value={density}
            onChange={(nextDensity) => onDensityChange(nextDensity as DataGridDensity)}
          />

          <div className="udg-column-menu__actions">
            <Button size="sm" type="button" variant="subtle" onClick={onShowAllColumns}>
              Show all
            </Button>
            <Button size="sm" type="button" variant="subtle" onClick={onHideOptionalColumns}>
              Hide optional
            </Button>
            <Menu
              className="udg-reset-menu"
              items={[
                {
                  id: "reset-order",
                  label: "Reset order",
                  onSelect: onResetColumnOrder
                },
                {
                  id: "reset-sizes",
                  label: "Reset sizes",
                  onSelect: onResetColumnSizes
                },
                {
                  id: "reset-columns",
                  label: "Reset columns",
                  onSelect: onResetColumns
                },
                {
                  id: "reset-view",
                  label: "Reset view",
                  onSelect: onResetView
                }
              ]}
              placement="bottom-end"
              size="sm"
              trigger={
                <ToolbarButton
                  icon={<Icon name="Reset" size="xs" />}
                  label="Reset"
                  size="sm"
                  type="button"
                  variant="subtle"
                />
              }
            />
          </div>

          <div className="udg-column-menu__list">
            {filteredColumns.length === 0 && (
              <div className="udg-column-menu__empty">No columns found.</div>
            )}

            {filteredColumns.map((column) => {
              const hideable = column.hideable !== false;
              const visible = visibleColumnIds.has(column.id);
              const index = orderedColumns.findIndex(
                (candidate) => candidate.id === column.id
              );

              return (
                <div
                  className={[
                    "udg-column-menu__row",
                    draggedColumnId === column.id ? "is-dragging" : "",
                    dropColumnId === column.id ? "is-drop-target" : ""
                  ].filter(Boolean).join(" ")}
                  key={column.id}
                  onDragLeave={() => setDropColumnId(null)}
                  onDragOver={(event) => {
                    event.preventDefault();
                    setDropColumnId(column.id);
                  }}
                  onDragStart={() => setDraggedColumnId(column.id)}
                  onDrop={(event) => handleDrop(event, column.id)}
                >
                  <button
                    aria-label={`Drag to reorder ${column.header} column`}
                    className="udg-column-menu__drag"
                    draggable
                    type="button"
                    title="Drag to reorder"
                    onDragEnd={() => {
                      setDraggedColumnId(null);
                      setDropColumnId(null);
                    }}
                    onDragStart={(event) => {
                      event.dataTransfer.effectAllowed = "move";
                      setDraggedColumnId(column.id);
                    }}
                  >
                    <Icon name="DragHandle" size="xs" />
                  </button>

                  <Checkbox
                    aria-label={
                      hideable
                        ? `Toggle ${column.header}`
                        : `${column.header} is required and cannot be hidden`
                    }
                    checked={visible}
                    className="udg-column-toggle"
                    disabled={!hideable}
                    size="sm"
                    title={hideable ? undefined : "Required column"}
                    onChange={(event) =>
                      onColumnVisibilityChange(
                        column.id,
                        event.currentTarget.checked
                      )
                    }
                  />

                  <span className="udg-column-menu__label" title={column.header}>
                    {column.header}
                  </span>

                  {!hideable && (
                    <Badge className="udg-column-menu__badge" size="sm">
                      Required
                    </Badge>
                  )}

                  <div className="udg-column-menu__row-actions">
                    <IconButton
                      aria-label={`Move ${column.header} up`}
                      className="udg-icon-button"
                      disabled={index === 0}
                      size="xs"
                      tooltip="Move up"
                      type="button"
                      variant="subtle"
                      onClick={() => onMoveColumn(column.id, "up")}
                    >
                      <Icon name="ChevronUp" size="xs" />
                    </IconButton>
                    <IconButton
                      aria-label={`Move ${column.header} down`}
                      className="udg-icon-button"
                      disabled={index === orderedColumns.length - 1}
                      size="xs"
                      tooltip="Move down"
                      type="button"
                      variant="subtle"
                      onClick={() => onMoveColumn(column.id, "down")}
                    >
                      <Icon name="ChevronDown" size="xs" />
                    </IconButton>
                    <Menu
                      className="udg-column-menu__more"
                      items={[
                        {
                          id: "move-first",
                          label: "Move to first",
                          onSelect: () => onMoveColumn(column.id, "first")
                        },
                        {
                          id: "move-last",
                          label: "Move to last",
                          onSelect: () => onMoveColumn(column.id, "last")
                        },
                        {
                          id: "reset-size",
                          label: "Reset size",
                          onSelect: () => onResetColumnSize(column.id)
                        },
                        ...(hideable
                          ? [
                              {
                                id: "toggle-visibility",
                                label: visible ? "Hide column" : "Show column",
                                onSelect: () =>
                                  onColumnVisibilityChange(column.id, !visible)
                              }
                            ]
                          : [])
                      ]}
                      placement="bottom-end"
                      size="sm"
                      trigger={
                        <IconButton
                          aria-label={`More actions for ${column.header}`}
                          size="xs"
                          tooltip="More actions"
                          type="button"
                          variant="subtle"
                        >
                          <Icon name="MoreHorizontal" size="xs" />
                        </IconButton>
                      }
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
