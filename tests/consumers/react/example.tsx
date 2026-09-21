import { Button, DescriptionList, TextInput } from "@vyrnforge/ui-components";
import "@vyrnforge/ui-components/styles/index.css";

export function ReactConsumerContract() {
  return (
    <>
      <Button variant="primary">React renderer</Button>
      <DescriptionList>
        <dt>Status</dt>
        <dd>Active</dd>
      </DescriptionList>
      <TextInput aria-label="Owner" defaultValue="Operations" />
    </>
  );
}
