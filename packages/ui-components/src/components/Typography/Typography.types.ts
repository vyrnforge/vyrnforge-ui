import type { HTMLAttributes, ReactNode } from "react";

export type TextTone = "default" | "muted" | "strong";

export type HeadingSize = "sm" | "md" | "lg";

export type TextProps = HTMLAttributes<HTMLParagraphElement> & {
  as?: "p" | "span" | "div";
  tone?: TextTone;
  children?: ReactNode;
};

export type HeadingProps = HTMLAttributes<HTMLHeadingElement> & {
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  size?: HeadingSize;
  children?: ReactNode;
};
