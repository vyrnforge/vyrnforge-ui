import { useEffect, useState } from "react";
import { SearchInput } from "@dravyn/ui-components";
import { useDebouncedValue } from "../hooks/useDebouncedValue";

export type DataGridSearchProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  debounceMs?: number;
};

export function DataGridSearch({
  value,
  onChange,
  placeholder = "Search",
  debounceMs = 150
}: DataGridSearchProps) {
  const [inputValue, setInputValue] = useState(value);
  const debouncedValue = useDebouncedValue(inputValue, debounceMs);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  useEffect(() => {
    if (debouncedValue !== value) {
      onChange(debouncedValue);
    }
  }, [debouncedValue, onChange, value]);

  return (
    <SearchInput
      aria-label={placeholder}
      className="udg-search-input"
      data-filled={inputValue.length > 0 ? "true" : "false"}
      placeholder={placeholder}
      size="sm"
      value={inputValue}
      wrapperClassName="udg-search"
      onChange={(event) => setInputValue(event.currentTarget.value)}
    />
  );
}
