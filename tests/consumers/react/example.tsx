import { Button } from "@vyrnforge/ui-components";
import "@vyrnforge/ui-elements/register";

export function ReactConsumerContract() {
  return (
    <>
      <Button variant="primary">React renderer</Button>
      <vf-button variant="primary">Native element in React</vf-button>
    </>
  );
}
