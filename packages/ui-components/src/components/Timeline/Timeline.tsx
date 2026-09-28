import { forwardRef } from "react";
import { joinClassNames } from "../../utils/classNames";
import type { TimelineProps, TimelineRef } from "./Timeline.types";

export const Timeline = forwardRef<TimelineRef, TimelineProps>(
  function Timeline({ className, ...props }, ref) {
    return (
      <ol
        className={joinClassNames(
          "vf-timeline",
          "vf-timeline__list",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
