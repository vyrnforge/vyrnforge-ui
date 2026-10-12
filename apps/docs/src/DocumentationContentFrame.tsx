import type { HTMLAttributes, ReactNode } from "react";
import {
  Breadcrumbs,
  PageHeader,
  type BreadcrumbItem,
} from "@vyrnforge/ui-components";

export type DocumentationContentLayout =
  | "reading"
  | "reference"
  | "catalog"
  | "example"
  | "wide";

type DocumentationContentFrameProps = Omit<
  HTMLAttributes<HTMLElement>,
  "title"
> & {
  actions?: ReactNode;
  aside?: ReactNode;
  breadcrumbs?: BreadcrumbItem[];
  children: ReactNode;
  description?: string;
  eyebrow?: ReactNode;
  footer?: ReactNode;
  layout?: DocumentationContentLayout;
  localNavigation?: ReactNode;
  status?: ReactNode;
  title: string;
};

export function DocumentationContentFrame({
  actions,
  aside,
  breadcrumbs,
  children,
  className,
  description,
  eyebrow,
  footer,
  layout = "reading",
  localNavigation,
  status,
  title,
  ...props
}: DocumentationContentFrameProps) {
  const frameClassName = ["vf-docs-content-frame", className]
    .filter(Boolean)
    .join(" ");

  return (
    <article className={frameClassName} data-content-layout={layout} {...props}>
      <div className="vf-docs-content-frame__header vf-reference-page__hero">
        <div
          className="vf-docs-content-frame__header-layout vf-reference-page__hero-layout"
        >
          <div
            className="vf-docs-content-frame__header-copy vf-reference-page__hero-copy"
          >
            <PageHeader
              actions={actions}
              breadcrumbs={
                breadcrumbs?.length ? (
                  <Breadcrumbs items={breadcrumbs} />
                ) : undefined
              }
              description={description}
              eyebrow={eyebrow}
              status={status}
              title={title}
            />
          </div>
          {aside ? (
            <aside
              className="vf-docs-content-frame__header-aside vf-reference-page__hero-aside"
            >
              {aside}
            </aside>
          ) : null}
        </div>
      </div>
      <div
        className="vf-docs-content-frame__columns"
        data-local-navigation={localNavigation ? "true" : "false"}
      >
        <div className="vf-docs-content-frame__body vf-reference-page__body">
          {children}
        </div>
        {localNavigation ? (
          <aside
            aria-label="On this page"
            className="vf-docs-content-frame__local-navigation"
          >
            {localNavigation}
          </aside>
        ) : null}
      </div>
      {footer ? (
        <footer className="vf-docs-content-frame__footer">{footer}</footer>
      ) : null}
    </article>
  );
}
