import { Button, ButtonGroup, Heading, Icon, IconButton, Text } from "@dravyn/ui-components";

const variants = ["default", "primary", "danger", "ghost", "subtle"] as const;
const sizes = ["sm", "md", "lg"] as const;

export function ButtonsPage() {
  return (
    <div className="page-stack">
      <section className="playground-panel">
        <Heading size="md">Button variants</Heading>
        <div className="control-grid">
          {variants.map((variant) => (
            <Button key={variant} variant={variant}>{variant}</Button>
          ))}
          <Button disabled>disabled</Button>
          <Button loading variant="primary">loading</Button>
          <Button leftSlot={<Icon name="Plus" />} rightSlot={<Icon name="ChevronRight" />} variant="primary">slots</Button>
          <Button fullWidth variant="subtle">full width</Button>
        </div>
      </section>

      <section className="playground-panel">
        <Heading size="md">Sizing and icon buttons</Heading>
        <Text tone="muted">Icon buttons use native button semantics and shared sizing tokens.</Text>
        <div className="control-grid">
          {sizes.map((size) => (
            <Button key={size} size={size} variant="primary">{size}</Button>
          ))}
          <IconButton aria-label="Add" title="Add"><Icon name="Plus" /></IconButton>
          <IconButton aria-label="Refresh" title="Refresh" variant="subtle"><Icon name="Refresh" /></IconButton>
          <IconButton aria-label="Delete" title="Delete" variant="danger"><Icon name="Delete" /></IconButton>
        </div>
      </section>

      <section className="playground-panel">
        <Heading size="md">Button group</Heading>
        <Text tone="muted">Grouped native buttons keep keyboard and disabled behavior intact.</Text>
        <ButtonGroup attached>
          <Button variant="subtle">Day</Button>
          <Button variant="primary">Week</Button>
          <Button variant="subtle">Month</Button>
        </ButtonGroup>
      </section>
    </div>
  );
}
