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
    <section className={joinClassNames("vf-section", className)} {...props}>
      {(title || description || actions) && (
        <div className="vf-section__header">
          <div>
            {title && <h2 className="vf-section__title">{title}</h2>}
            {description && <p className="vf-section__description">{description}</p>}
          </div>
          {actions && <div className="vf-section__actions">{actions}</div>}
        </div>
      )}
      {children}
    </section>
  );
}
