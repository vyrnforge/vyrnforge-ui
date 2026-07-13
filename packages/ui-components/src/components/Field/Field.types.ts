import type { HTMLAttributes, ReactNode } from "react";

export type FieldControlProps = {
  id: string;
  "aria-describedby"?: string;
  "aria-invalid"?: boolean;
  "aria-required"?: boolean;
  disabled?: boolean;
  required?: boolean;
};

export type FieldChildren =
  | ReactNode
  | ((controlProps: FieldControlProps) => ReactNode);

export type FieldProps = Omit<HTMLAttributes<HTMLDivElement>, "children" | "id"> & {
  /**
   * The generated control id used by a Field render function. For static
   * children, continue to pair `htmlFor` with the child control's `id`.
   */
  id?: string;
  label?: ReactNode;
  description?: ReactNode;
  error?: ReactNode;
  warning?: ReactNode;
  success?: ReactNode;
  message?: ReactNode;
  invalid?: boolean;
  required?: boolean;
  disabled?: boolean;
  htmlFor?: string;
  orientation?: "vertical" | "horizontal";
  children?: FieldChildren;
};
