import { Button, EmptyState, ErrorState, Heading, LoadingState, Skeleton } from "@dravyn/ui-components";

export function EmptyErrorLoadingPage() {
  return (
    <div className="playground-grid three">
      <section className="playground-card">
        <Heading size="sm">Empty page</Heading>
        <EmptyState
          title="No orders found"
          description="Try a different filter or create the first order."
          action={<Button size="sm" variant="primary">Create order</Button>}
        />
      </section>
      <section className="playground-card">
        <Heading size="sm">Error page</Heading>
        <ErrorState
          title="Sync failed"
          description="The source returned an unavailable response."
          action={<Button size="sm" variant="danger">Retry sync</Button>}
        />
      </section>
      <section className="playground-card">
        <Heading size="sm">Loading page</Heading>
        <LoadingState title="Preparing report" description="Resolving totals and permissions." />
        <div className="skeleton-stack">
          <Skeleton width="90%" height={12} />
          <Skeleton width="70%" height={12} />
          <Skeleton width="100%" height={44} />
        </div>
      </section>
    </div>
  );
}
