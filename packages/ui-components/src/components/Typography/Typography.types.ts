import type { HTMLAttributes, LabelHTMLAttributes, ReactNode } from "react";

export type TextTone =
  | "default"
  | "muted"
  | "strong"
  | "danger"
  | "success"
  | "warning";

export type HeadingSize = "sm" | "md" | "lg";
export type TextSize = "sm" | "md" | "lg";

export type TextProps = HTMLAttributes<HTMLParagraphElement> & {
  as?: "p" | "span" | "div";
  tone?: TextTone;
  size?: TextSize;
  children?: ReactNode;
};

export type HeadingProps = HTMLAttributes<HTMLHeadingElement> & {
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  size?: HeadingSize;
  tone?: TextTone;
  children?: ReactNode;
};

export type LabelProps = LabelHTMLAttributes<HTMLLabelElement> & {
  tone?: TextTone;
  size?: "sm" | "md";
};

export type CaptionProps = HTMLAttributes<HTMLElement> & {
  as?: "small" | "span" | "p";
  tone?: TextTone;
};

export type CodeTextProps = HTMLAttributes<HTMLElement> & {
  as?: "code" | "span";
  tone?: TextTone;
};
