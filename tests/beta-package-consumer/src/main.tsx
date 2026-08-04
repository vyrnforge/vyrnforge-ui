import React from "react";
import { createRoot } from "react-dom/client";

import { createBehaviorEvent } from "@vyrnforge/ui-behaviors";
import { Button, Card, Stack, Text } from "@vyrnforge/ui-components";
import {
  createVyrnForgeTheme,
  toVyrnForgeThemeStyle,
} from "@vyrnforge/ui-core";
import { registerVyrnForgeElements } from "@vyrnforge/ui-elements";

import { registeredTagCount } from "./entrypoints";
import "./styles.css";

registerVyrnForgeElements();

const verificationEvent = createBehaviorEvent(
  "beta-package-consumer",
  { packageCount: 4 },
  "programmatic",
);
const theme = createVyrnForgeTheme({
  "--vf-primary": "#2563eb",
});

function NativeButtonExample() {
  const hostRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const nativeButton: HTMLElementTagNameMap["vf-button"] =
      document.createElement("vf-button");
    nativeButton.textContent = "Native beta element";

    const host = hostRef.current;
    host?.append(nativeButton);

    return () => nativeButton.remove();
  }, []);

  return <div ref={hostRef} />;
}

function App() {
  return (
    <main style={toVyrnForgeThemeStyle(theme)} className="vf-beta-consumer">
      <Card variant="bordered" padding="md">
        <Stack gap="md">
          <Text>Offline beta package verification</Text>
          <Text tone="muted">
            {registeredTagCount} native tags; reason {verificationEvent.reason}
          </Text>
          <Button variant="primary">Verified entry points</Button>
          <NativeButtonExample />
        </Stack>
      </Card>
    </main>
  );
}

createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
