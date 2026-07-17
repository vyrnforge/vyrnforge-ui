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
    <section className={joinClassNames("vf-panel", className)} {...props}>
      {(title || description || actions) && (
        <div className="vf-panel__header">
          <div className="vf-panel__heading">
            {title && <h2 className="vf-panel__title">{title}</h2>}
            {description && <p className="vf-panel__description">{description}</p>}
          </div>
          {actions && <div className="vf-panel__actions">{actions}</div>}
        </div>
      )}
      {children && <div className="vf-panel__body">{children}</div>}
    </section>
  );
}
