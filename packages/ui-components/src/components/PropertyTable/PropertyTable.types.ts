import type { HTMLAttributes, ReactElement, TableHTMLAttributes } from "react";

export type PropertyTableRef = HTMLDivElement;

export type PropertyTableProps = Omit<
  HTMLAttributes<HTMLDivElement>,
  "children"
> & {
  children: ReactElement<TableHTMLAttributes<HTMLTableElement>, "table">;
};
