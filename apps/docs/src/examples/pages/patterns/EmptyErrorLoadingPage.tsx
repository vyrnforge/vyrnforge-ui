import {
  Button,
  Card,
  EmptyState,
  ErrorState,
  Heading,
  Icon,
  LoadingState,
  Skeleton,
  Stack,
} from "@vyrnforge/ui-components";

export function EmptyErrorLoadingPage() {
  return (
    <div className="vf-docs-example-grid vf-docs-example-grid--three">
      <Card padding="md" variant="bordered">
        <Stack gap="md">
          <Heading size="sm">Empty page</Heading>
          <EmptyState
            title="No orders found"
            description="Try a different filter or create the first order."
            action={
              <Button
                leftSlot={<Icon name="Plus" />}
                size="sm"
                variant="primary"
              >
                Create order
              </Button>
            }
          />
        </Stack>
      </Card>
      <Card padding="md" variant="bordered">
        <Stack gap="md">
          <Heading size="sm">Error page</Heading>
          <ErrorState
            title="Sync failed"
            description="The source returned an unavailable response."
            action={
              <Button
                leftSlot={<Icon name="Refresh" />}
                size="sm"
                variant="danger"
              >
                Retry sync
              </Button>
            }
          />
        </Stack>
      </Card>
      <Card padding="md" variant="bordered">
        <Stack gap="md">
          <Heading size="sm">Loading page</Heading>
          <LoadingState
            title="Preparing report"
            description="Resolving totals and permissions."
          />
          <Stack gap="sm">
            <Skeleton width="90%" height={12} />
            <Skeleton width="70%" height={12} />
            <Skeleton width="100%" height={44} />
          </Stack>
        </Stack>
      </Card>
    </div>
  );
}
