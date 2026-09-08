import { Button, TextInput } from "@vyrnforge/ui-components";
import "@vyrnforge/ui-components/styles/index.css";

export function ReactConsumerContract() {
  return (
    <>
      <Button variant="primary">React renderer</Button>
      <TextInput aria-label="Owner" defaultValue="Operations" />
    </>
  );
}
