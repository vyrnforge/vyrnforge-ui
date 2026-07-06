export type DataGridFilterOperator =
  | "contains"
  | "equals"
  | "notEquals"
  | "startsWith"
  | "endsWith"
  | "isEmpty"
  | "isNotEmpty"
  | "greaterThan"
  | "greaterThanOrEqual"
  | "lessThan"
  | "lessThanOrEqual";

export type DataGridFilter = {
  id: string;
  columnId: string;
  operator: DataGridFilterOperator;
  value?: unknown;
};

export type DataGridSort = {
  columnId: string;
  direction: "asc" | "desc";
};
