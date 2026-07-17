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
    <span className={joinClassNames("vf-search-input", wrapperClassName)}>
      <span aria-hidden="true" className="vf-search-input__icon">
        <Icon name="Search" size="sm" />
      </span>
      <input
        aria-invalid={invalid || undefined}
        className={joinClassNames("vf-input", `vf-input--${size}`, className)}
        ref={ref}
        type="search"
        {...props}
      />
    </span>
  );
});
