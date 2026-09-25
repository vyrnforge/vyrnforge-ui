import type { ReactNode } from "react";
import { AdminShellPage } from "./patterns/AdminShellPage";
import { AssignmentPatternsPage } from "./patterns/AssignmentPatternsPage";
import { CustomerPortalShellPage } from "./patterns/CustomerPortalShellPage";
import { DetailPage } from "./patterns/DetailPage";
import { EmptyErrorLoadingPage } from "./patterns/EmptyErrorLoadingPage";
import { FilterFormPage } from "./patterns/FilterFormPage";
import { FormPage } from "./patterns/FormPage";
import { ResourceListPage } from "./patterns/ResourceListPage";
import { SettingsPage } from "./patterns/SettingsPage";

const patternExamples: Record<string, ReactNode> = {
  "resource-list": <ResourceListPage />,
  detail: <DetailPage />,
  settings: <SettingsPage />,
  form: <FormPage />,
  "filter-form": <FilterFormPage />,
  "assignment-patterns": <AssignmentPatternsPage />,
  "empty-error-loading": <EmptyErrorLoadingPage />,
  "admin-shell": <AdminShellPage />,
  "customer-portal-shell": <CustomerPortalShellPage />,
};

export function getPatternExample(patternId: string) {
  return patternExamples[patternId] ?? null;
}
