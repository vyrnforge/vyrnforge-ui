import { Button, Heading, IconButton, Text } from "@dravyn/ui-components";

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
          <Button className="full-width-demo" variant="subtle">width by class</Button>
        </div>
      </section>

      <section className="playground-panel">
        <Heading size="md">Sizing and icon buttons</Heading>
        <Text tone="muted">Icon buttons use native button semantics and shared sizing tokens.</Text>
        <div className="control-grid">
          {sizes.map((size) => (
            <Button key={size} size={size} variant="primary">{size}</Button>
          ))}
          <IconButton aria-label="Add" title="Add">+</IconButton>
          <IconButton aria-label="Refresh" title="Refresh" variant="subtle">R</IconButton>
          <IconButton aria-label="Delete" title="Delete" variant="danger">x</IconButton>
        </div>
      </section>
    </div>
  );
}
