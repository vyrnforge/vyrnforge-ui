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
    <header className={joinClassNames("vf-page-header", className)} {...props}>
      {breadcrumbs && <div className="vf-page-header__breadcrumbs">{breadcrumbs}</div>}
      <div className="vf-page-header__row">
        <div className="vf-page-header__main">
          {eyebrow && <div className="vf-page-header__eyebrow">{eyebrow}</div>}
          <div className="vf-page-header__title-row">
            <h1 className="vf-page-header__title">{title}</h1>
            {status && <div className="vf-page-header__status">{status}</div>}
          </div>
          {description && (
            <div className="vf-page-header__description">{description}</div>
          )}
          {metadata && <div className="vf-page-header__metadata">{metadata}</div>}
        </div>
        {actions && <div className="vf-page-header__actions">{actions}</div>}
      </div>
    </header>
  );
}
