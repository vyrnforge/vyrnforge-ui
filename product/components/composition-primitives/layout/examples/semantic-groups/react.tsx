import { Flow } from '@vyrnforge/react/layout';
import { Radio } from '@vyrnforge/react/radio';

export function SemanticGroupsExample() {
  return (
    <fieldset>
      <legend>Reminder frequency</legend>
      <Flow gap="sm">
        <Flow as="label" direction="inline" gap="sm">
          <Radio name="layout-react-frequency" value="daily" defaultChecked /> Daily
        </Flow>
        <Flow as="label" direction="inline" gap="sm">
          <Radio name="layout-react-frequency" value="weekly" /> Weekly
        </Flow>
      </Flow>
    </fieldset>
  );
}
