import type { ReactNode } from "react";
import { Badge, Text, type BreadcrumbItem } from "@vyrnforge/ui-components";
import type { DocumentationReadinessStatus } from "../../../docs/reference/documentationAvailability";
import {
  DocumentationContentFrame,
  type DocumentationContentLayout,
} from "./DocumentationContentFrame";
import type { DocsTemplateDefinition } from "./referenceRoutes";

export type DocumentationPageFamily =
  "landing" | "reading" | "catalog" | "reference" | "showcase" | "dedicated";

type DocumentationPageTemplateProps = {
  breadcrumbs?: BreadcrumbItem[];
  children: ReactNode;
  description?: string;
  family?: DocumentationPageFamily;
  footer?: ReactNode;
  heroActions?: ReactNode;
  heroAside?: ReactNode;
  heroDescription?: string;
  heroTitle?: string;
  layout?: DocumentationContentLayout;
  localNavigation?: ReactNode;
  status: DocumentationReadinessStatus;
  template: DocsTemplateDefinition;
  title: string;
};

export function DocumentationPageTemplate({
  breadcrumbs,
  children,
  description,
  family = "reading",
  footer,
  heroActions,
  heroAside,
  heroDescription,
  heroTitle,
  layout = "reading",
  localNavigation,
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
    <DocumentationContentFrame
      actions={heroActions}
      aside={heroAside}
      breadcrumbs={breadcrumbs}
      className={pageClassName}
      data-document-template={template.id}
      data-page-family={family}
      data-template-sections={template.sections.join(" ")}
      description={heroDescription ?? description}
      eyebrow={
        <Text className="vf-reference-page__eyebrow" size="sm">
          {template.label}
        </Text>
      }
      footer={footer}
      layout={layout}
      localNavigation={localNavigation}
      status={
        <Badge size="sm" tone="subtle" variant="success">
          {status}
        </Badge>
      }
      title={heroTitle ?? title}
    >
      {children}
    </DocumentationContentFrame>
  );
}
