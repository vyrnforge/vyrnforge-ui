import { useEffect, useState } from "react";
import { useDebouncedValue } from "../hooks/useDebouncedValue";
import { DataGridIcon } from "./DataGridIcon";

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
    <label className="udg-search">
      <span className="udg-sr-only">{placeholder}</span>
      <DataGridIcon className="udg-search-icon" name="search" />
      <input
        aria-label={placeholder}
        className="udg-search-input"
        data-filled={inputValue.length > 0 ? "true" : "false"}
        placeholder={placeholder}
        type="search"
        value={inputValue}
        onChange={(event) => setInputValue(event.currentTarget.value)}
      />
    </label>
  );
}
