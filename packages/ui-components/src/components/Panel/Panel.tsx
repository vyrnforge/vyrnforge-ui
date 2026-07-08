import { joinClassNames } from "../../utils/classNames";
import type { PanelProps } from "./Panel.types";

export function Panel({
  actions,
  children,
  className,
  description,
  title,
  ...props
}: PanelProps) {
  return (
    <section className={joinClassNames("dv-panel", className)} {...props}>
      {(title || description || actions) && (
        <div className="dv-panel__header">
          <div className="dv-panel__heading">
            {title && <h2 className="dv-panel__title">{title}</h2>}
            {description && <p className="dv-panel__description">{description}</p>}
          </div>
          {actions && <div className="dv-panel__actions">{actions}</div>}
        </div>
      )}
      {children && <div className="dv-panel__body">{children}</div>}
    </section>
  );
}
