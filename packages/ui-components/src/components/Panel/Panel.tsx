import {
  adoptedRegionClassName,
  resolveAdoptedHostClassName,
} from "../../internal/hostAdoption";
import type { PanelProps } from "./Panel.types";

const region = (name: string) => adoptedRegionClassName("panel", name);

export function Panel({
  actions,
  children,
  className,
  description,
  title,
  ...props
}: PanelProps) {
  return (
    <section
      className={resolveAdoptedHostClassName("panel", {}, className)}
      {...props}
    >
      {(title || description || actions) && (
        <div className={region("header")}>
          <div className={region("heading")}>
            {title && <h2 className={region("title")}>{title}</h2>}
            {description && (
              <p className={region("description")}>{description}</p>
            )}
          </div>
          {actions && <div className={region("actions")}>{actions}</div>}
        </div>
      )}
      {children && <div className={region("body")}>{children}</div>}
    </section>
  );
}
