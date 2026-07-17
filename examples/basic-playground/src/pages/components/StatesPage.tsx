import { Button, EmptyState, ErrorState, Icon, InlineMessage, LoadingState, Skeleton } from "@vyrnforge/ui-components";
import { DemoBlock } from "../../components/DemoBlock";
import { DemoPage } from "../../components/DemoPage";
import { DemoSection } from "../../components/DemoSection";

export function StatesPage() {
  return (
    <DemoPage
      accessibility="Loading and error content must state what is happening in text, not only through color or animation."
      avoid="Avoid leaving a blank panel when content is unavailable or still loading."
      description="Reusable feedback states for empty data, retryable failures, and asynchronous loading."
      importSnippet={'import { EmptyState, ErrorState, LoadingState, Skeleton } from "@vyrnforge/ui-components";'}
      packageName="@vyrnforge/ui-components"
      relatedComponents={["Alert", "InlineMessage", "Button"]}
      status="candidate"
      title="Feedback states"
      usage="Use a dedicated state when it describes the whole content area; use InlineMessage for local feedback."
    >
      <DemoSection description="Choose the state that explains why the expected content is not present." title="Full-area states">
        <div className="vf-playground-demo-grid">
          <DemoBlock code={'<EmptyState title="No saved views" description="Create a view once filters are ready." />'} preview={<EmptyState title="No saved views" description="Create a view once filters and columns are ready." actions={<Button leftSlot={<Icon name="Plus" />} size="sm" variant="primary">Create view</Button>} />} title="Empty state" />
          <DemoBlock code={'<ErrorState title="Could not load records" retryAction={<Button>Retry</Button>} />'} preview={<ErrorState title="Could not load records" description="Retry the request or check the source connection." retryAction={<Button leftSlot={<Icon name="Refresh" />} size="sm" variant="danger">Retry</Button>} />} title="Error state" />
        </div>
      </DemoSection>
      <DemoSection description="Keep local and loading feedback compact." title="Loading and inline feedback">
        <DemoBlock code={'<LoadingState label="Loading workspace" />\n<InlineMessage variant="success">Policy updated</InlineMessage>'} preview={<div className="vf-playground-page-stack"><LoadingState label="Loading workspace" description="Fetching current settings." /><div className="vf-playground-skeleton-stack"><Skeleton height={12} width="80%" /><Skeleton height={12} width="64%" /><Skeleton animated={false} height={32} radius={6} width="100%" /></div><InlineMessage title="Policy updated" variant="success">Inline feedback can sit inside forms, cards, and panels.</InlineMessage></div>} title="Progress and local messages" />
      </DemoSection>
    </DemoPage>
  );
}
