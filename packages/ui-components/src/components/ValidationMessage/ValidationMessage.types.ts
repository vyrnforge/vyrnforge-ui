import type { HTMLAttributes, ReactNode } from "react";

export type ValidationMessageTone =
  | "default"
  | "error"
  | "danger"
  | "success"
  | "warning"
  | "info";

export type ValidationMessageProps = HTMLAttributes<HTMLDivElement> & {
  tone?: ValidationMessageTone;
  children?: ReactNode;
};
