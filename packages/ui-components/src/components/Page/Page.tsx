import { joinClassNames } from "../../utils/classNames";
import { PageHeader } from "../PageHeader";
import type { PageProps } from "./Page.types";

export function Page({
  actions,
  children,
  className,
  density = "standard",
  description,
  eyebrow,
  maxWidth = "lg",
  status,
  title,
  toolbar,
  ...props
}: PageProps) {
  const hasHeader = title || description || eyebrow || status || actions;

  return (
    <main
      className={joinClassNames(
        "vf-page",
        `vf-page--max-${maxWidth}`,
        `vf-page--${density}`,
        className
      )}
      {...props}
    >
      {hasHeader && (
        <PageHeader
          actions={actions}
          description={description}
          eyebrow={eyebrow}
          status={status}
          title={title}
        />
      )}
      {toolbar && <div className="vf-page__toolbar">{toolbar}</div>}
      {children && <div className="vf-page__body">{children}</div>}
    </main>
  );
}
