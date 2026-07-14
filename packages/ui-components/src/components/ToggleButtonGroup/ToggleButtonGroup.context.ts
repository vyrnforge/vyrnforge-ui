import { createContext, useContext } from "react";
import type { ToggleButtonSize } from "../ToggleButton";

export type ToggleButtonGroupContextValue = {
  disabled: boolean;
  size?: ToggleButtonSize;
  isPressed: (value: string) => boolean;
  toggle: (value: string) => void;
};

export const ToggleButtonGroupContext = createContext<ToggleButtonGroupContextValue | null>(null);

export function useToggleButtonGroupContext() {
  return useContext(ToggleButtonGroupContext);
}
