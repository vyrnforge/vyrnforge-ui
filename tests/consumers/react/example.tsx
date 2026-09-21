import {
  Button,
  DescriptionList,
  Progress,
  TextInput,
} from "@vyrnforge/ui-components";
import "@vyrnforge/ui-components/styles/index.css";

export function ReactConsumerContract() {
  return (
    <>
      <Button variant="primary">React renderer</Button>
      <DescriptionList>
        <dt>Status</dt>
        <dd>Active</dd>
      </DescriptionList>
      <Progress aria-label="Upload progress" max={100} value={40} />
      <TextInput aria-label="Owner" defaultValue="Operations" />
    </>
  );
}
