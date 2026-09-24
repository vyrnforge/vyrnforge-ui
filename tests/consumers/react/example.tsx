import {
  Button,
  DescriptionList,
  Progress,
  Timeline,
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
      <Timeline aria-label="Deployment history">
        <li><time dateTime="2026-09-24T01:00:00Z">01:00</time> Created</li>
        <li><time dateTime="2026-09-24T02:00:00Z">02:00</time> Deployed</li>
      </Timeline>
      <Progress aria-label="Upload progress" max={100} value={40} />
      <TextInput aria-label="Owner" defaultValue="Operations" />
    </>
  );
}
