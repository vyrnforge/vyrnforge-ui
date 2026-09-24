import { Children, cloneElement, forwardRef, isValidElement } from "react";
import { joinClassNames } from "../../utils/classNames";
import type { TimelineProps, TimelineRef } from "./Timeline.types";

export const Timeline = forwardRef<TimelineRef, TimelineProps>(
  function Timeline({ className, children, ...props }, ref) {
    return (
      <ol
        className={joinClassNames("vf-timeline", "vf-timeline__list", className)}
        ref={ref}
        {...props}
      >
        {Children.map(children, (child) =>
          isValidElement(child)
            ? cloneElement(child, {
                className: joinClassNames(
                  "vf-timeline__item",
                  (child.props as { className?: string }).className,
                ),
              } as never)
            : child,
        )}
      </ol>
    );
  },
);
