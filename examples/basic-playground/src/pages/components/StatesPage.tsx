import { Button, EmptyState, ErrorState, Heading, LoadingState, Skeleton } from "@dravyn/ui-components";

export function StatesPage() {
  return (
    <div className="playground-grid three">
      <section className="playground-card">
        <Heading size="sm">Empty</Heading>
        <EmptyState
          title="No saved views"
          description="Create a view once filters and columns are ready."
          action={<Button size="sm" variant="primary">Create view</Button>}
        />
      </section>
      <section className="playground-card">
        <Heading size="sm">Error</Heading>
        <ErrorState
          title="Could not load records"
          description="Retry the request or check the source connection."
          action={<Button size="sm" variant="danger">Retry</Button>}
        />
      </section>
      <section className="playground-card">
        <Heading size="sm">Loading</Heading>
        <LoadingState title="Loading workspace" description="Fetching current settings." />
        <div className="skeleton-stack">
          <Skeleton height={12} width="80%" />
          <Skeleton height={12} width="64%" />
          <Skeleton height={32} width="100%" />
        </div>
      </section>
    </div>
  );
}
