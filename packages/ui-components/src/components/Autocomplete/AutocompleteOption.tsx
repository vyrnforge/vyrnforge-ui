import type { MouseEvent, PointerEvent, ReactNode } from "react";
import { joinClassNames } from "../../utils/classNames";
import type { AutocompleteOptionData } from "./Autocomplete.types";

type AutocompleteOptionProps = {
  id: string;
  option: AutocompleteOptionData;
  active: boolean;
  selected: boolean;
  onPointerDown: (event: PointerEvent<HTMLDivElement>) => void;
  onClick: (event: MouseEvent<HTMLDivElement>) => void;
  onPointerMove: () => void;
  children: ReactNode;
};

export function AutocompleteOption({
  active,
  children,
  id,
  onClick,
  onPointerDown,
  onPointerMove,
  option,
  selected
}: AutocompleteOptionProps) {
  return (
    <div
      aria-disabled={option.disabled || undefined}
      aria-selected={selected}
      className={joinClassNames(
        "dv-autocomplete__option",
        active && "dv-autocomplete__option--active",
        selected && "dv-autocomplete__option--selected",
        option.disabled && "dv-autocomplete__option--disabled"
      )}
      id={id}
      onClick={onClick}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      role="option"
    >
      {children}
    </div>
  );
}
