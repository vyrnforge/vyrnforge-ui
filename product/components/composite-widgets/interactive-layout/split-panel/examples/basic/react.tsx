import { SplitPanelPane, SplitPanelResizeHandle, SplitPanelRoot } from '@vyrnforge/react/split-panel';
export function Example() {
  return (
    <SplitPanelRoot defaultSize={50}>
      <SplitPanelPane id="primary-pane">Primary</SplitPanelPane>
      <SplitPanelResizeHandle aria-label="Primary" aria-controls="primary-pane" />
      <SplitPanelPane>Secondary</SplitPanelPane>
    </SplitPanelRoot>
  );
}
