import {
  adoptedRegionClassName,
  resolveAdoptedHostClassName,
} from "../../internal/hostAdoption";
import type { SectionProps } from "./Section.types";

const region = (name: string) => adoptedRegionClassName("section", name);

export function Section({
  actions,
  children,
  className,
  description,
  title,
  ...props
}: SectionProps) {
  return (
    <section
      className={resolveAdoptedHostClassName("section", {}, className)}
      {...props}
    >
      {(title || description || actions) && (
        <div className={region("header")}>
          <div>
            {title && <h2 className={region("title")}>{title}</h2>}
            {description && (
              <p className={region("description")}>{description}</p>
            )}
          </div>
          {actions && <div className={region("actions")}>{actions}</div>}
        </div>
      )}
      {children}
    </section>
  );
}
