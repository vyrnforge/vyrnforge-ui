import { useMemo, useState, type DragEvent } from "react";
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
import { DataGridIcon } from "./DataGridIcon";

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

const densityIconName: Record<
  DataGridDensity,
  "densityCompact" | "densityStandard" | "densityComfortable"
> = {
  compact: "densityCompact",
  standard: "densityStandard",
  comfortable: "densityComfortable"
};

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
      <button
        aria-expanded={open}
        className="udg-toolbar-button"
        type="button"
        onClick={() => setOpen((currentOpen) => !currentOpen)}
      >
        <DataGridIcon name="columns" />
        <span>Columns</span>
      </button>

      {open && (
        <div
          className="udg-column-menu-panel"
          role="dialog"
          aria-label="Column settings"
        >
          <div className="udg-column-menu__header">
            <strong>Columns</strong>
            <button
              aria-label="Close column settings"
              className="udg-icon-button"
              type="button"
              onClick={() => setOpen(false)}
            >
              <DataGridIcon name="x" />
            </button>
          </div>

          <label className="udg-column-menu__search">
            <span className="udg-sr-only">Search columns</span>
            <input
              placeholder="Search columns"
              type="search"
              value={search}
              onChange={(event) => setSearch(event.currentTarget.value)}
            />
          </label>

          <div
            className="udg-column-menu__density udg-segmented-control"
            aria-label="Density"
            role="group"
          >
            {densityOptions.map((densityOption) => (
              <button
                aria-pressed={density === densityOption}
                className={density === densityOption ? "is-active" : undefined}
                key={densityOption}
                title={`${densityOption} density`}
                type="button"
                onClick={() => onDensityChange(densityOption)}
              >
                <DataGridIcon name={densityIconName[densityOption]} />
                <span className="udg-sr-only">{densityOption}</span>
              </button>
            ))}
          </div>

          <div className="udg-column-menu__actions">
            <button type="button" onClick={onShowAllColumns}>
              Show all
            </button>
            <button type="button" onClick={onHideOptionalColumns}>
              Hide optional
            </button>
            <details className="udg-reset-menu">
              <summary>
                <DataGridIcon name="reset" />
                <span>Reset</span>
                <DataGridIcon name="chevronDown" />
              </summary>
              <div className="udg-reset-menu__panel">
                <button type="button" onClick={onResetColumnOrder}>
                  Reset order
                </button>
                <button type="button" onClick={onResetColumnSizes}>
                  Reset sizes
                </button>
                <button type="button" onClick={onResetColumns}>
                  Reset columns
                </button>
                <button type="button" onClick={onResetView}>
                  Reset view
                </button>
              </div>
            </details>
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
                    <DataGridIcon name="gripVertical" />
                  </button>

                  <label className="udg-column-toggle">
                    <input
                      aria-label={
                        hideable
                          ? `Toggle ${column.header}`
                          : `${column.header} is required and cannot be hidden`
                      }
                      checked={visible}
                      disabled={!hideable}
                      title={hideable ? undefined : "Required column"}
                      type="checkbox"
                      onChange={(event) =>
                        onColumnVisibilityChange(
                          column.id,
                          event.currentTarget.checked
                        )
                      }
                    />
                  </label>

                  <span className="udg-column-menu__label" title={column.header}>
                    {column.header}
                  </span>

                  {!hideable && (
                    <span className="udg-column-menu__badge">Required</span>
                  )}

                  <div className="udg-column-menu__row-actions">
                    <button
                      aria-label={`Move ${column.header} up`}
                      className="udg-icon-button"
                      disabled={index === 0}
                      title="Move up"
                      type="button"
                      onClick={() => onMoveColumn(column.id, "up")}
                    >
                      <DataGridIcon name="arrowUp" />
                    </button>
                    <button
                      aria-label={`Move ${column.header} down`}
                      className="udg-icon-button"
                      disabled={index === orderedColumns.length - 1}
                      title="Move down"
                      type="button"
                      onClick={() => onMoveColumn(column.id, "down")}
                    >
                      <DataGridIcon name="arrowDown" />
                    </button>
                    <details className="udg-column-menu__more">
                      <summary aria-label={`More actions for ${column.header}`}>
                        <DataGridIcon name="moreHorizontal" />
                      </summary>
                      <div className="udg-column-menu__more-panel">
                        <button
                          type="button"
                          onClick={() => onMoveColumn(column.id, "first")}
                        >
                          Move to first
                        </button>
                        <button
                          type="button"
                          onClick={() => onMoveColumn(column.id, "last")}
                        >
                          Move to last
                        </button>
                        <button
                          type="button"
                          onClick={() => onResetColumnSize(column.id)}
                        >
                          Reset size
                        </button>
                        {hideable && (
                          <button
                            type="button"
                            onClick={() =>
                              onColumnVisibilityChange(column.id, !visible)
                            }
                          >
                            {visible ? "Hide column" : "Show column"}
                          </button>
                        )}
                      </div>
                    </details>
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
