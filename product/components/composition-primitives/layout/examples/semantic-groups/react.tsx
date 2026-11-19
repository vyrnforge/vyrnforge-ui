export function SemanticGroupsExample() {
  return (
    <fieldset style={{ minInlineSize: 0, border: '1px solid var(--vf-color-border)', padding: 'var(--vf-space-md)' }}>
      <legend>Reminder frequency</legend>
      <div data-vf-flow data-vf-flow-gap="sm">
        <label data-vf-flow data-vf-flow-direction="inline" data-vf-flow-gap="sm">
          <input type="radio" name="layout-react-frequency" value="daily" defaultChecked /> Daily
        </label>
        <label data-vf-flow data-vf-flow-direction="inline" data-vf-flow-gap="sm">
          <input type="radio" name="layout-react-frequency" value="weekly" /> Weekly
        </label>
      </div>
    </fieldset>
  );
}
