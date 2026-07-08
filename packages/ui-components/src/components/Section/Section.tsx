import { joinClassNames } from "../../utils/classNames";
import type { SectionProps } from "./Section.types";

export function Section({
  actions,
  children,
  className,
  description,
  title,
  ...props
}: SectionProps) {
  return (
    <section className={joinClassNames("dv-section", className)} {...props}>
      {(title || description || actions) && (
        <div className="dv-section__header">
          <div>
            {title && <h2 className="dv-section__title">{title}</h2>}
            {description && <p className="dv-section__description">{description}</p>}
          </div>
          {actions && <div className="dv-section__actions">{actions}</div>}
        </div>
      )}
      {children}
    </section>
  );
}
