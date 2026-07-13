import type { HTMLAttributes, ReactNode } from "react";

export type ValidationMessageTone =
  | "error"
  | "danger"
  | "success"
  | "warning"
  | "info";

export type ValidationMessageProps = HTMLAttributes<HTMLDivElement> & {
  tone?: ValidationMessageTone;
  children?: ReactNode;
};
