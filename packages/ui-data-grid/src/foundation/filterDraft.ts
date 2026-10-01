import type { DataGridFilter, DataGridFoundationColumnDef } from "./types";
import { sanitizeDataGridFilters } from "./filterOperators";

export type DataGridFilterDraftSession = {
  appliedFilters: DataGridFilter[];
  draftFilters: DataGridFilter[];
};

function cloneFilters(filters: DataGridFilter[]): DataGridFilter[] {
  return filters.map((filter) => ({ ...filter }));
}

export function createDataGridFilterDraftSession<
  RowData extends Record<string, unknown> = Record<string, unknown>,
>(
  columns: DataGridFoundationColumnDef<RowData>[],
  appliedFilters: DataGridFilter[],
): DataGridFilterDraftSession {
  const normalized = sanitizeDataGridFilters(columns, appliedFilters);

  return {
    appliedFilters: cloneFilters(normalized),
    draftFilters: cloneFilters(normalized),
  };
}

export function setDataGridFilterDraft<
  RowData extends Record<string, unknown> = Record<string, unknown>,
>(
  session: DataGridFilterDraftSession,
  columns: DataGridFoundationColumnDef<RowData>[],
  draftFilters: DataGridFilter[],
): DataGridFilterDraftSession {
  return {
    appliedFilters: cloneFilters(session.appliedFilters),
    draftFilters: cloneFilters(sanitizeDataGridFilters(columns, draftFilters)),
  };
}

export function clearDataGridFilterDraft(
  session: DataGridFilterDraftSession,
): DataGridFilterDraftSession {
  return {
    appliedFilters: cloneFilters(session.appliedFilters),
    draftFilters: [],
  };
}

export function resetDataGridFilterDraft(
  session: DataGridFilterDraftSession,
): DataGridFilterDraftSession {
  return {
    appliedFilters: cloneFilters(session.appliedFilters),
    draftFilters: cloneFilters(session.appliedFilters),
  };
}

export function cancelDataGridFilterDraft(
  session: DataGridFilterDraftSession,
): DataGridFilterDraftSession {
  return resetDataGridFilterDraft(session);
}

export function applyDataGridFilterDraft<
  RowData extends Record<string, unknown> = Record<string, unknown>,
>(
  session: DataGridFilterDraftSession,
  columns: DataGridFoundationColumnDef<RowData>[],
): DataGridFilterDraftSession {
  const appliedFilters = sanitizeDataGridFilters(columns, session.draftFilters);

  return {
    appliedFilters: cloneFilters(appliedFilters),
    draftFilters: cloneFilters(appliedFilters),
  };
}
