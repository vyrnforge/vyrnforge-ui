import {
  adoptedRegionClassName,
  resolveAdoptedHostClassName,
} from "../../internal/hostAdoption";
import type { PageHeaderProps } from "./PageHeader.types";

const region = (name: string) => adoptedRegionClassName("page-header", name);

export function PageHeader({
  actions,
  breadcrumbs,
  className,
  description,
  eyebrow,
  metadata,
  status,
  title,
  ...props
}: PageHeaderProps) {
  return (
    <header
      className={resolveAdoptedHostClassName("page-header", {}, className)}
      {...props}
    >
      {breadcrumbs && (
        <div className={region("breadcrumbs")}>{breadcrumbs}</div>
      )}
      <div className={region("row")}>
        <div className={region("main")}>
          {eyebrow && <div className={region("eyebrow")}>{eyebrow}</div>}
          <div className={region("title-row")}>
            <h1 className={region("title")}>{title}</h1>
            {status && <div className={region("status")}>{status}</div>}
          </div>
          {description && (
            <div className={region("description")}>{description}</div>
          )}
          {metadata && <div className={region("metadata")}>{metadata}</div>}
        </div>
        {actions && <div className={region("actions")}>{actions}</div>}
      </div>
    </header>
  );
}
