import { createElement } from "react";
import { Heading, Inline, Stack, Text } from "@vyrnforge/ui-components";
import componentDocumentationPreviewsRaw from "../../../docs/generated/component-documentation-previews.json?raw";
import { LegacyReferenceComponentSpecimen } from "./LegacyReferenceComponentSpecimen";
import { getComponentReferenceRecord } from "./referenceData";

type PreviewPrimitive = string | number | boolean;

type PreviewItem = {
  text: string;
  props?: Record<string, PreviewPrimitive>;
};

type PreviewRecipe = {
  layout: "inline" | "stack";
  items: PreviewItem[];
};

type OwnedPreviewExample = {
  id: string;
  title: string;
  intent: string;
  frameworks: Array<"native-html" | "react" | "angular" | "vue">;
  preview: PreviewRecipe | null;
};

type OwnedPreviewComponent = {
  componentId: string;
  sourcePath: string;
  examples: OwnedPreviewExample[];
};

type OwnedPreviewProjection = {
  schemaVersion: 1;
  generatedFrom: string[];
  components: OwnedPreviewComponent[];
};

const previewProjection = JSON.parse(
  componentDocumentationPreviewsRaw,
) as OwnedPreviewProjection;
const previewByComponentId = new Map(
  previewProjection.components.map((component) => [
    component.componentId,
    component,
  ]),
);

function PreviewItems({
  componentTagName,
  preview,
}: {
  componentTagName: string;
  preview: PreviewRecipe;
}) {
  const items = preview.items.map((item, index) =>
    createElement(
      componentTagName,
      {
        key: `${item.text}-${index}`,
        ...(item.props ?? {}),
      },
      item.text,
    ),
  );

  return preview.layout === "inline" ? (
    <Inline align="center" gap="sm" wrap>
      {items}
    </Inline>
  ) : (
    <Stack gap="sm">{items}</Stack>
  );
}

function OwnedComponentPreview({
  component,
  componentTagName,
}: {
  component: OwnedPreviewComponent;
  componentTagName: string;
}) {
  return (
    <Stack gap="lg">
      {component.examples.map((example) => (
        <section key={example.id}>
          <Stack gap="sm">
            <div>
              <Heading level={4} size="sm">
                {example.title}
              </Heading>
              <Text size="sm" tone="muted">
                {example.intent}
              </Text>
            </div>
            {example.preview ? (
              <PreviewItems
                componentTagName={componentTagName}
                preview={example.preview}
              />
            ) : (
              <Text size="sm" tone="muted">
                This composition is documented by the owning package and does
                not yet have a renderer-neutral live recipe.
              </Text>
            )}
          </Stack>
        </section>
      ))}
    </Stack>
  );
}

export function ReferenceComponentSpecimen({
  componentId,
  relatedPatterns,
}: {
  componentId: string;
  relatedPatterns: string[];
}) {
  const ownedPreview = previewByComponentId.get(componentId);
  const componentTagName =
    getComponentReferenceRecord(componentId)?.nativeDeclaration?.tagName ?? null;

  const specimen =
    ownedPreview && componentTagName ? (
      <OwnedComponentPreview
        component={ownedPreview}
        componentTagName={componentTagName}
      />
    ) : (
      <LegacyReferenceComponentSpecimen
        componentId={componentId}
        relatedPatterns={relatedPatterns}
      />
    );

  return (
    <section className="vf-docs-component-specimen">
      <div className="vf-docs-component-specimen__heading">
        <div>
          <Text className="vf-docs-catalog__kicker" size="sm">
            Live specimen
          </Text>
          <Heading level={3} size="md">
            See the component before reading its contract.
          </Heading>
        </div>
      </div>
      <div className="vf-docs-component-specimen__stage">{specimen}</div>
    </section>
  );
}
