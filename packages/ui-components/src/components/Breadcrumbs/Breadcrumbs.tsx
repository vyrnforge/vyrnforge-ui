import { joinClassNames } from "../../utils/classNames";
import type { BreadcrumbItem, BreadcrumbsProps } from "./Breadcrumbs.types";

function itemKey(item: BreadcrumbItem, index: number) {
  return item.id ?? `${String(item.label)}-${index}`;
}

export function Breadcrumbs({
  className,
  items,
  separator = "/",
  ...props
}: BreadcrumbsProps) {
  return (
    <nav
      aria-label={props["aria-label"] ?? "Breadcrumb"}
      className={joinClassNames("vf-breadcrumbs", className)}
      {...props}
    >
      <ol className="vf-breadcrumbs__list">
        {items.map((item, index) => {
          const current = item.current || index === items.length - 1;
          const content = item.href && !current ? (
            <a className="vf-breadcrumbs__link" href={item.href} onClick={item.onClick}>
              {item.label}
            </a>
          ) : item.onClick && !current ? (
            <button
              className="vf-breadcrumbs__link"
              onClick={item.onClick}
              type="button"
            >
              {item.label}
            </button>
          ) : (
            <span aria-current={current ? "page" : undefined} className="vf-breadcrumbs__current">
              {item.label}
            </span>
          );

          return (
            <li className="vf-breadcrumbs__item" key={itemKey(item, index)}>
              {index > 0 && (
                <span aria-hidden="true" className="vf-breadcrumbs__separator">
                  {separator}
                </span>
              )}
              {content}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
