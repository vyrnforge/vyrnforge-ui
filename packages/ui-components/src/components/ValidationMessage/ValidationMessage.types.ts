import type { HTMLAttributes, ReactNode } from "react";

export type ValidationMessageTone = "default" | "danger" | "success" | "warning";

export type ValidationMessageProps = HTMLAttributes<HTMLDivElement> & {
  tone?: ValidationMessageTone;
  children?: ReactNode;
};
