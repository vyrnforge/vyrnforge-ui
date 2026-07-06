export type DataGridSearchProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
};

export function DataGridSearch({
  value,
  onChange,
  placeholder = "Search"
}: DataGridSearchProps) {
  return (
    <label className="udg-search">
      <span className="udg-sr-only">{placeholder}</span>
      <input
        className="udg-search-input"
        placeholder={placeholder}
        type="search"
        value={value}
        onChange={(event) => onChange(event.currentTarget.value)}
      />
    </label>
  );
}
