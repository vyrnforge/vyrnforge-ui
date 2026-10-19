import {
  adoptedRegionClassName,
  resolveAdoptedHostClassName,
} from "../../internal/hostAdoption";
import { PageHeader } from "../PageHeader";
import type { PageProps } from "./Page.types";

const region = (name: string) => adoptedRegionClassName("page", name);

export function Page({
  actions,
  children,
  className,
  density = "standard",
  description,
  eyebrow,
  maxWidth = "lg",
  status,
  title,
  toolbar,
  ...props
}: PageProps) {
  const hasHeader = title || description || eyebrow || status || actions;

  return (
    <main
      className={resolveAdoptedHostClassName(
        "page",
        { density, maxWidth },
        className,
      )}
      {...props}
    >
      {hasHeader && (
        <PageHeader
          actions={actions}
          description={description}
          eyebrow={eyebrow}
          status={status}
          title={title}
        />
      )}
      {toolbar && <div className={region("toolbar")}>{toolbar}</div>}
      {children && <div className={region("body")}>{children}</div>}
    </main>
  );
}
