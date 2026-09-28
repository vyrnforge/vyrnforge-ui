import { forwardRef } from "react";
import { joinClassNames } from "../../utils/classNames";
import type {
  PropertyTableProps,
  PropertyTableRef,
} from "./PropertyTable.types";

export const PropertyTable = forwardRef<PropertyTableRef, PropertyTableProps>(
  function PropertyTable({ className, children, ...props }, ref) {
    return (
      <div
        className={joinClassNames("vf-property-table", className)}
        ref={ref}
        {...props}
      >
        {children}
      </div>
    );
  },
);
