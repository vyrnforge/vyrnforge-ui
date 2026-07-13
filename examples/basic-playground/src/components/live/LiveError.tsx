import { useContext } from "react";
import { Alert, Text } from "@dravyn/ui-components";
import { LiveContext, LiveError as ReactLiveError } from "react-live";

export function LiveError() {
  const { error } = useContext(LiveContext);

  if (!error) {
    return null;
  }

  return (
    <Alert className="dv-playground-live-error" title="Example error" variant="danger">
      <Text size="sm">Fix the highlighted example source to restore the preview.</Text>
      <div className="dv-playground-live-error__details"><ReactLiveError /></div>
    </Alert>
  );
}
