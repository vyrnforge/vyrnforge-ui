import { Flow } from '@vyrnforge/react/layout';

export function SemanticGroupsExample() {
  return (
    <fieldset style={{ minInlineSize: 0, border: '1px solid var(--vf-color-border)', padding: 'var(--vf-space-md)' }}>
      <legend>Reminder frequency</legend>
      <Flow gap="sm">
        <Flow as="label" direction="inline" gap="sm">
          <input type="radio" name="layout-react-frequency" value="daily" defaultChecked /> Daily
        </Flow>
        <Flow as="label" direction="inline" gap="sm">
          <input type="radio" name="layout-react-frequency" value="weekly" /> Weekly
        </Flow>
      </Flow>
    </fieldset>
  );
}
