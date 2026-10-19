import { createContext } from "react";

export const OverlayTopmostContext = createContext<() => boolean>(() => true);
