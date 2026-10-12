import type { ReactNode } from "react";
import { Badge, PageHeader, Text } from "@vyrnforge/ui-components";
import type { DocumentationReadinessStatus } from "../../../docs/reference/documentationAvailability";
import type { DocsTemplateDefinition } from "./referenceRoutes";

export type DocumentationPageFamily =
  | "landing"
  | "reading"
  | "catalog"
  | "reference"
  | "showcase"
  | "dedicated";

type DocumentationPageTemplateProps = {
  children: ReactNode;
  description?: string;
  family?: DocumentationPageFamily;
  status: DocumentationReadinessStatus;
  template: DocsTemplateDefinition;
  title: string;
};

export function DocumentationPageTemplate({
  children,
  description,
  family = "reading",
  status,
  template,
  title,
}: DocumentationPageTemplateProps) {
  const pageClassName = [
    "vf-reference-page",
    `vf-reference-page--family-${family}`,
    `vf-reference-page--template-${template.id}`,
  ].join(" ");

  return (
    <article
      className={pageClassName}
      data-document-template={template.id}
      data-page-family={family}
      data-template-sections={template.sections.join(" ")}
    >
      <header
        aria-label="Reference page introduction"
        className="vf-reference-page__hero"
      >
        <div className="vf-reference-page__hero-copy">
          <div className="vf-reference-page__meta">
            <Text className="vf-reference-page__eyebrow" size="sm">
              {template.label}
            </Text>
            <Badge size="sm" tone="subtle" variant="success">
              {status}
            </Badge>
          </div>
          <PageHeader description={description} title={title} />
        </div>
      </header>
      <div className="vf-reference-page__body">{children}</div>
    </article>
  );
}
