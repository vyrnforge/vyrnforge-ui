import type { ReactNode } from "react";

type AutocompleteListboxProps = {
  id: string;
  children: ReactNode;
};

export function AutocompleteListbox({ children, id }: AutocompleteListboxProps) {
  return <div aria-label="Suggestions" className="vf-autocomplete__listbox" id={id} role="listbox">{children}</div>;
}
