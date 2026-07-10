import type { CSSProperties, InputHTMLAttributes, ReactNode } from "react";

export type RadioProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
  label?: ReactNode;
  description?: ReactNode;
  invalid?: boolean;
  className?: string;
  style?: CSSProperties;
};
