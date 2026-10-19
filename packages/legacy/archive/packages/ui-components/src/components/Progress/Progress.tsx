import { forwardRef } from "react";
import { joinClassNames } from "../../utils/classNames";
import type { ProgressProps, ProgressRef } from "./Progress.types";

export const Progress = forwardRef<ProgressRef, ProgressProps>(
  function Progress({ className, max = 1, value = null, ...props }, ref) {
    return (
      <progress
        className={joinClassNames("vf-progress", className)}
        max={max}
        ref={ref}
        value={value ?? undefined}
        {...props}
      />
    );
  },
);
