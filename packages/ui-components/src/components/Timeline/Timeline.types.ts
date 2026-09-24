import type { HTMLAttributes, ReactElement } from "react";

export type TimelineRef = HTMLOListElement;

export type TimelineProps = Omit<HTMLAttributes<HTMLOListElement>, "children"> & {
  children: ReactElement<HTMLAttributes<HTMLLIElement>, "li"> | readonly ReactElement<HTMLAttributes<HTMLLIElement>, "li">[];
};
