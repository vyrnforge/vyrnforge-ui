import type { HTMLAttributes, ReactNode } from "react";

export type TopNavProps = HTMLAttributes<HTMLElement> & {
  brand?: ReactNode;
  navigation?: ReactNode;
  actions?: ReactNode;
  userArea?: ReactNode;
};
