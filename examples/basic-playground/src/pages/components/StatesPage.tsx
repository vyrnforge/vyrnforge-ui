import {
  Button,
  EmptyState,
  ErrorState,
  Heading,
  Icon,
  InlineMessage,
  LoadingState,
  Skeleton
} from "@dravyn/ui-components";

export function StatesPage() {
  return (
    <div className="playground-grid three">
      <section className="playground-card">
        <Heading size="sm">Empty</Heading>
        <EmptyState
          title="No saved views"
          description="Create a view once filters and columns are ready."
          actions={<Button leftSlot={<Icon name="Plus" />} size="sm" variant="primary">Create view</Button>}
        />
      </section>
      <section className="playground-card">
        <Heading size="sm">Error</Heading>
        <ErrorState
          title="Could not load records"
          description="Retry the request or check the source connection."
          retryAction={<Button leftSlot={<Icon name="Refresh" />} size="sm" variant="danger">Retry</Button>}
        />
      </section>
      <section className="playground-card">
        <Heading size="sm">Loading</Heading>
        <LoadingState label="Loading workspace" description="Fetching current settings." />
        <div className="skeleton-stack">
          <Skeleton height={12} width="80%" />
          <Skeleton height={12} width="64%" />
          <Skeleton animated={false} height={32} radius={6} width="100%" />
        </div>
      </section>
      <section className="playground-card">
        <Heading size="sm">Inline message</Heading>
        <InlineMessage title="Policy updated" variant="success">
          Inline feedback can sit inside forms, cards, and panels.
        </InlineMessage>
      </section>
    </div>
  );
}
