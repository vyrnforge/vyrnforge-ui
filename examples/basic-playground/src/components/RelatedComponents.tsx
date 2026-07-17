import { Badge, Panel } from "@vyrnforge/ui-components";

export type RelatedComponentsProps = {
  components?: string[];
};

export function RelatedComponents({ components = [] }: RelatedComponentsProps) {
  if (components.length === 0) {
    return null;
  }

  return (
    <Panel className="dv-playground-related-components" title="Related components">
      <div className="dv-playground-related-components__list">
        {components.map((component) => (
          <Badge key={component} tone="subtle">{component}</Badge>
        ))}
      </div>
    </Panel>
  );
}
