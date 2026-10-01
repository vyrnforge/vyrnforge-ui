import type {
  DataGridColumnDataType,
  DataGridFilter,
  DataGridFilterOperator,
  DataGridFoundationColumnDef,
} from "./types";

const textOperators: DataGridFilterOperator[] = [
  "contains",
  "equals",
  "notEquals",
  "startsWith",
  "endsWith",
  "isEmpty",
  "isNotEmpty",
];

const comparableOperators: DataGridFilterOperator[] = [
  "equals",
  "notEquals",
  "gt",
  "gte",
  "lt",
  "lte",
  "isEmpty",
  "isNotEmpty",
];

const choiceOperators: DataGridFilterOperator[] = [
  "equals",
  "notEquals",
  "isEmpty",
  "isNotEmpty",
];

export function getDataGridFilterOperators(
  dataType: DataGridColumnDataType = "string",
): DataGridFilterOperator[] {
  switch (dataType) {
    case "number":
    case "date":
    case "datetime":
      return [...comparableOperators];
    case "boolean":
    case "enum":
    case "status":
      return [...choiceOperators];
    case "custom":
    case "string":
    default:
      return [...textOperators];
  }
}

export function getDataGridFilterOperatorsForColumn(
  column: Pick<DataGridFoundationColumnDef, "dataType" | "filterable">,
): DataGridFilterOperator[] {
  if (column.filterable === false) {
    return [];
  }

  return getDataGridFilterOperators(column.dataType);
}

export function normalizeDataGridFilterOperator(
  operator: DataGridFilterOperator,
): DataGridFilterOperator {
  switch (operator) {
    case "greaterThan":
      return "gt";
    case "greaterThanOrEqual":
      return "gte";
    case "lessThan":
      return "lt";
    case "lessThanOrEqual":
      return "lte";
    default:
      return operator;
  }
}

export function isDataGridFilterOperatorSupported(
  column: Pick<DataGridFoundationColumnDef, "dataType" | "filterable">,
  operator: DataGridFilterOperator,
): boolean {
  const normalizedOperator = normalizeDataGridFilterOperator(operator);
  return getDataGridFilterOperatorsForColumn(column).includes(
    normalizedOperator,
  );
}

export function sanitizeDataGridFilters<
  RowData extends Record<string, unknown> = Record<string, unknown>,
>(
  columns: DataGridFoundationColumnDef<RowData>[],
  filters: DataGridFilter[],
): DataGridFilter[] {
  const columnsById = new Map(columns.map((column) => [column.id, column]));

  return filters.flatMap((filter) => {
    const column = columnsById.get(filter.columnId);
    if (!column) {
      return [];
    }

    const operator = normalizeDataGridFilterOperator(filter.operator);
    if (!isDataGridFilterOperatorSupported(column, operator)) {
      return [];
    }

    return [{ ...filter, operator }];
  });
}
