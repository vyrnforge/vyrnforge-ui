import { joinClassNames } from "../../utils/classNames";
import type { PageHeaderProps } from "./PageHeader.types";

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
    <header className={joinClassNames("dv-page-header", className)} {...props}>
      {breadcrumbs && <div className="dv-page-header__breadcrumbs">{breadcrumbs}</div>}
      <div className="dv-page-header__row">
        <div className="dv-page-header__main">
          {eyebrow && <div className="dv-page-header__eyebrow">{eyebrow}</div>}
          <div className="dv-page-header__title-row">
            <h1 className="dv-page-header__title">{title}</h1>
            {status && <div className="dv-page-header__status">{status}</div>}
          </div>
          {description && (
            <div className="dv-page-header__description">{description}</div>
          )}
          {metadata && <div className="dv-page-header__metadata">{metadata}</div>}
        </div>
        {actions && <div className="dv-page-header__actions">{actions}</div>}
      </div>
    </header>
  );
}
