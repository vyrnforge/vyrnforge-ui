import type { HTMLAttributes, LiHTMLAttributes, ReactElement } from "react";

export type TimelineRef = HTMLOListElement;

export type TimelineEntry = ReactElement<
  LiHTMLAttributes<HTMLLIElement>,
  "li"
>;

export type TimelineProps = Omit<
  HTMLAttributes<HTMLOListElement>,
  "children"
> & {
  children: TimelineEntry | readonly TimelineEntry[];
};
