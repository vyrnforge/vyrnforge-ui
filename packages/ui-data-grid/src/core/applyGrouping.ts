import type { DataGridColumnDef } from "../types/column.types";
import type {
  DataGridDisplayRow,
  DataGridGroupIdContext,
  DataGridGroupPathItem,
  DataGridGroupRow,
  DataGridLeafRow,
  DataGridRowId
} from "../types/dataGrid.types";
import { getRowIdValue, type DataGridRowIdGetter } from "./rowSelection";

type GroupBucket<RowData extends Record<string, unknown>> = {
  value: unknown;
  rows: RowData[];
};

export type BuildGroupedRowsParams<
  RowData extends Record<string, unknown> = Record<string, unknown>
> = {
  rows: RowData[];
  columns: DataGridColumnDef<RowData>[];
  grouping: string[];
  expandedGroupIds?: string[];
  getRowId?: DataGridRowIdGetter<RowData>;
  getGroupId?: (context: DataGridGroupIdContext<RowData>) => string;
};

const emptyValueLabel = "(blank)";

function getColumnValue<RowData extends Record<string, unknown>>(
  row: RowData,
  column: DataGridColumnDef<RowData>
) {
  if (column.groupValue) {
    return column.groupValue(row);
  }

  if (column.accessorFn) {
    return column.accessorFn(row);
  }

  if (column.accessorKey) {
    return row[column.accessorKey as keyof RowData];
  }

  return row[column.id as keyof RowData];
}

function serializeGroupValue(value: unknown) {
  if (value instanceof Date) {
    return value.toISOString();
  }

  if (value === null) {
    return "null";
  }

  if (value === undefined) {
    return "undefined";
  }

  if (typeof value === "object") {
    try {
      return JSON.stringify(value);
    } catch {
      return String(value);
    }
  }

  return String(value);
}

function getGroupLabel<RowData extends Record<string, unknown>>(
  column: DataGridColumnDef<RowData>,
  value: unknown
) {
  if (column.groupLabel) {
    return column.groupLabel(value);
  }

  if (value === null || value === undefined || value === "") {
    return emptyValueLabel;
  }

  if (value instanceof Date) {
    return value.toLocaleDateString();
  }

  return String(value);
}

export function resolveGroupableColumns<
  RowData extends Record<string, unknown>
>(columns: DataGridColumnDef<RowData>[]) {
  return columns.filter((column) => column.groupable !== false);
}

export function normalizeGrouping<
  RowData extends Record<string, unknown>
>(columns: DataGridColumnDef<RowData>[], grouping: string[]) {
  const groupableIds = new Set(
    resolveGroupableColumns(columns).map((column) => column.id)
  );
  const normalizedGrouping: string[] = [];

  grouping.forEach((columnId) => {
    if (!groupableIds.has(columnId) || normalizedGrouping.includes(columnId)) {
      return;
    }

    normalizedGrouping.push(columnId);
  });

  return normalizedGrouping;
}

export function createGroupId<
  RowData extends Record<string, unknown>
>({
  columnId,
  depth,
  parentId,
  value
}: DataGridGroupIdContext<RowData>) {
  const segment = `${depth}:${columnId}:${encodeURIComponent(
    serializeGroupValue(value)
  )}`;
  return parentId ? `${parentId}/${segment}` : segment;
}

export function getGroupLeafRows<
  RowData extends Record<string, unknown>
>(displayRows: DataGridDisplayRow<RowData>[]): DataGridLeafRow<RowData>[] {
  return displayRows.flatMap((displayRow) =>
    displayRow.type === "row"
      ? [displayRow]
      : getGroupLeafRows(displayRow.children)
  );
}

export function getGroupLeafRowIds<
  RowData extends Record<string, unknown>
>(displayRows: DataGridDisplayRow<RowData>[]): DataGridRowId[] {
  return getGroupLeafRows(displayRows).map((row) => row.id);
}

export function buildGroupedRows<
  RowData extends Record<string, unknown>
>({
  rows,
  columns,
  grouping,
  expandedGroupIds = [],
  getRowId,
  getGroupId
}: BuildGroupedRowsParams<RowData>): DataGridDisplayRow<RowData>[] {
  const normalizedGrouping = normalizeGrouping(columns, grouping);

  if (normalizedGrouping.length === 0) {
    return rows.map((row, index) => ({
      type: "row",
      id: getRowIdValue(row, index, getRowId),
      row,
      index,
      depth: 0
    }));
  }

  const columnsById = new Map(columns.map((column) => [column.id, column]));
  const expandedGroupIdSet = new Set(expandedGroupIds);

  const buildLevel = (
    levelRows: RowData[],
    depth: number,
    parentId: string | undefined,
    path: DataGridGroupPathItem[]
  ): DataGridDisplayRow<RowData>[] => {
    const columnId = normalizedGrouping[depth];
    const column = columnsById.get(columnId);

    if (!column) {
      return levelRows.map((row) => {
        const index = rows.indexOf(row);
        return {
          type: "row",
          id: getRowIdValue(row, index, getRowId),
          row,
          index,
          depth
        };
      });
    }

    const buckets = new Map<string, GroupBucket<RowData>>();
    levelRows.forEach((row) => {
      const value = getColumnValue(row, column);
      const key = serializeGroupValue(value);
      const bucket = buckets.get(key);

      if (bucket) {
        bucket.rows.push(row);
        return;
      }

      buckets.set(key, {
        value,
        rows: [row]
      });
    });

    return [...buckets.values()].map((bucket): DataGridGroupRow<RowData> => {
      const nextPath = [
        ...path,
        {
          columnId,
          value: bucket.value
        }
      ];
      const fallbackId = createGroupId({
        columnId,
        value: bucket.value,
        depth,
        parentId,
        path: nextPath,
        rows: bucket.rows
      });
      const id =
        getGroupId?.({
          columnId,
          value: bucket.value,
          depth,
          parentId,
          path: nextPath,
          rows: bucket.rows
        }) ?? fallbackId;
      const children =
        depth === normalizedGrouping.length - 1
          ? bucket.rows.map((row) => {
              const index = rows.indexOf(row);
              return {
                type: "row" as const,
                id: getRowIdValue(row, index, getRowId),
                row,
                index,
                depth: depth + 1
              };
            })
          : buildLevel(bucket.rows, depth + 1, id, nextPath);
      const leafRows = getGroupLeafRows(children);

      return {
        type: "group",
        id,
        depth,
        columnId,
        value: bucket.value,
        label: getGroupLabel(column, bucket.value),
        rowCount: leafRows.length,
        leafRowIds: leafRows.map((row) => row.id),
        children,
        isExpanded: expandedGroupIdSet.has(id)
      };
    });
  };

  return buildLevel(rows, 0, undefined, []);
}

export function flattenGroupedRows<
  RowData extends Record<string, unknown>
>(displayRows: DataGridDisplayRow<RowData>[]): DataGridDisplayRow<RowData>[] {
  return displayRows.flatMap((displayRow) => {
    if (displayRow.type === "row") {
      return [displayRow];
    }

    return displayRow.isExpanded
      ? [displayRow, ...flattenGroupedRows(displayRow.children)]
      : [displayRow];
  });
}

export function toggleGroupExpanded(
  expandedGroupIds: string[],
  groupId: string
) {
  return expandedGroupIds.includes(groupId)
    ? expandedGroupIds.filter((expandedGroupId) => expandedGroupId !== groupId)
    : [...expandedGroupIds, groupId];
}

export function expandAllGroups<
  RowData extends Record<string, unknown>
>(displayRows: DataGridDisplayRow<RowData>[]): string[] {
  return displayRows.flatMap((displayRow) =>
    displayRow.type === "group"
      ? [displayRow.id, ...expandAllGroups(displayRow.children)]
      : []
  );
}

export function collapseAllGroups() {
  return [] as string[];
}

export function applyGrouping<RowData>(
  rows: RowData[],
  _grouping: string[]
): RowData[] {
  return rows;
}
