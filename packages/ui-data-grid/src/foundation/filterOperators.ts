import type {
  DataGridColumnDataType,
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
