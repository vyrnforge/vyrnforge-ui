import { forwardRef } from "react";
import { joinClassNames } from "../../utils/classNames";
import { Icon } from "../Icon";
import type { SearchInputProps } from "./SearchInput.types";

export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(function SearchInput({
  className,
  invalid = false,
  size = "md",
  wrapperClassName,
  ...props
}, ref) {
  return (
    <span className={joinClassNames("dv-search-input", wrapperClassName)}>
      <span aria-hidden="true" className="dv-search-input__icon">
        <Icon name="Search" size="sm" />
      </span>
      <input
        aria-invalid={invalid || undefined}
        className={joinClassNames("dv-input", `dv-input--${size}`, className)}
        ref={ref}
        type="search"
        {...props}
      />
    </span>
  );
});
