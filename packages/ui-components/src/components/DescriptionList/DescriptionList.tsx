import { forwardRef } from "react";
import { joinClassNames } from "../../utils/classNames";
import type {
  DescriptionListProps,
  DescriptionListRef,
} from "./DescriptionList.types";

export const DescriptionList = forwardRef<
  DescriptionListRef,
  DescriptionListProps
>(function DescriptionList({ className, ...props }, ref) {
  return (
    <dl
      className={joinClassNames(
        "vf-description-list",
        "vf-description-list__list",
        className,
      )}
      ref={ref}
      {...props}
    />
  );
});
