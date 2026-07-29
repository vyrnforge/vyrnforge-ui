import { Button } from "@vyrnforge/ui-components";
import "@vyrnforge/ui-elements/register";
import type { VyrnForgeElementForTagName } from "@vyrnforge/ui-elements";
import { useRef } from "react";

type NativeButtonElement = VyrnForgeElementForTagName<"vf-button">;

export function ReactConsumerContract() {
  const nativeButton = useRef<NativeButtonElement>(null);

  return (
    <>
      <Button variant="primary">React renderer</Button>
      <vf-button ref={nativeButton} variant="primary">
        Native element in React
      </vf-button>
    </>
  );
}
