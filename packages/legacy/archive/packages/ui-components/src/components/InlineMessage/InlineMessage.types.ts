import type { HTMLAttributes, ReactNode } from "react";
import type { BadgeVariant } from "../Badge";

export type InlineMessageVariant = BadgeVariant;

export type InlineMessageProps = HTMLAttributes<HTMLDivElement> & {
  variant?: InlineMessageVariant;
  title?: ReactNode;
  children?: ReactNode;
};
