import { createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { AccountOverview } from '../../product/components/composition-primitives/layout/examples/basic/react.tsx';
import { FlowBlockExample } from '../../product/components/composition-primitives/layout/examples/flow-block/react.tsx';
import { FlowInlineExample } from '../../product/components/composition-primitives/layout/examples/flow-inline/react.tsx';
import { FlowWrapExample } from '../../product/components/composition-primitives/layout/examples/flow-wrap/react.tsx';
import { AutoGridExample } from '../../product/components/composition-primitives/layout/examples/auto-grid/react.tsx';
import { SemanticGroupsExample } from '../../product/components/composition-primitives/layout/examples/semantic-groups/react.tsx';
import { NativeDividersExample } from '../../product/components/composition-primitives/layout/examples/dividers/react.tsx';

// Documentation-only adapter: live TSX demos are owned by the Layout product unit.
// Uses the real public React Flow, Input and Text components and canonical Web styles.
const examples = {
  basic: AccountOverview,
  'flow-block': FlowBlockExample,
  'flow-inline': FlowInlineExample,
  'flow-wrap': FlowWrapExample,
  'auto-grid': AutoGridExample,
  'semantic-groups': SemanticGroupsExample,
  dividers: NativeDividersExample,
};
const root = document.getElementById('root');
const exampleId = document.body.dataset.vfLayoutExample;
if (root && exampleId && Object.hasOwn(examples, exampleId)) {
  createRoot(root).render(createElement(examples[exampleId]));
}
