import type { SearchInputProps } from "./SearchInput.types";

const joinClassNames = (...classNames: Array<string | undefined | false>) =>
  classNames.filter(Boolean).join(" ");

export function SearchInput({
  className,
  invalid = false,
  ...props
}: SearchInputProps) {
  return (
    <span className="dv-search-input">
      <span aria-hidden="true" className="dv-search-input__icon">
        /
      </span>
      <input
        aria-invalid={invalid || undefined}
        className={joinClassNames("dv-input", className)}
        type="search"
        {...props}
      />
    </span>
  );
}
