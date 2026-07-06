import { useEffect, useState } from "react";
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
    <label className="udg-search">
      <span className="udg-sr-only">{placeholder}</span>
      <input
        className="udg-search-input"
        placeholder={placeholder}
        type="search"
        value={inputValue}
        onChange={(event) => setInputValue(event.currentTarget.value)}
      />
    </label>
  );
}
