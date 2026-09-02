import { createContext, useContext, type ReactNode } from "react";
import type { PlaygroundFrameworkId } from "./playgroundContext";

type PlaygroundFrameworkContextValue = {
  frameworkId: PlaygroundFrameworkId;
  onFrameworkChange: (frameworkId: PlaygroundFrameworkId) => void;
};

const PlaygroundFrameworkContext =
  createContext<PlaygroundFrameworkContextValue | null>(null);

export function PlaygroundFrameworkProvider({
  children,
  frameworkId,
  onFrameworkChange,
}: PlaygroundFrameworkContextValue & { children: ReactNode }) {
  return (
    <PlaygroundFrameworkContext.Provider
      value={{ frameworkId, onFrameworkChange }}
    >
      {children}
    </PlaygroundFrameworkContext.Provider>
  );
}

export function usePlaygroundFramework() {
  const context = useContext(PlaygroundFrameworkContext);
  if (!context) {
    throw new Error(
      "usePlaygroundFramework must be used within PlaygroundFrameworkProvider.",
    );
  }

  return context;
}
