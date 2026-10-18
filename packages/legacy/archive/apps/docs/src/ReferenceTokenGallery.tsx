import {
  Button,
  Card,
  CodeText,
  DescriptionList,
  Heading,
  Stack,
  Text,
} from "@vyrnforge/ui-components";
import type { DesignTokenCategory, DesignTokenRecord } from "./discoveryData";

function token(category: DesignTokenCategory, name: string) {
  return category.tokens.find((item) => item.name === name);
}

function tokenValue(name: string) {
  return `var(${name})`;
}

function ColorSwatch({ item }: { item: DesignTokenRecord }) {
  return (
    <Card className="vf-docs-token-swatch" padding="sm" variant="bordered">
      <span
        className="vf-docs-token-swatch__sample"
        style={{ background: tokenValue(item.name) }}
      />
      <CodeText>{item.name}</CodeText>
      <Text size="sm" tone="muted">
        {item.purpose}
      </Text>
    </Card>
  );
}

function ColorCategory({ category }: { category: DesignTokenCategory }) {
  return (
    <div className="vf-docs-token-swatch-grid">
      {category.tokens.map((item) => (
        <ColorSwatch item={item} key={item.name} />
      ))}
    </div>
  );
}

function TypographyCategory({ category }: { category: DesignTokenCategory }) {
  const roles = [
    [
      "display",
      "Display",
      "Build complex products from one shared UI foundation.",
    ],
    ["page-title", "Page title", "Workspace settings"],
    ["section-title", "Section title", "Permissions and access"],
    ["label", "Label", "Workspace name"],
    [
      "body",
      "Body",
      "Use shared semantics instead of application-specific styling.",
    ],
    ["caption", "Caption", "Updated 2 minutes ago"],
    ["code", "Code", "@vyrnforge/ui-components"],
  ] as const;

  return (
    <Stack className="vf-docs-token-type-specimens" gap="sm">
      {roles.map(([role, label, sample]) => {
        const family = token(category, `--vf-type-${role}-font-family`);
        const size = token(category, `--vf-type-${role}-font-size`);
        const weight = token(category, `--vf-type-${role}-font-weight`);
        const lineHeight = token(category, `--vf-type-${role}-line-height`);
        const letterSpacing = token(
          category,
          `--vf-type-${role}-letter-spacing`,
        );
        return (
          <Card
            className="vf-docs-token-type-specimen"
            key={role}
            padding="sm"
            variant="bordered"
          >
            <Stack gap="xs">
              <Text className="vf-docs-catalog__kicker" size="sm">
                {label}
              </Text>
              <div
                className="vf-docs-token-type-specimen__sample"
                style={{
                  fontFamily: family ? tokenValue(family.name) : undefined,
                  fontSize: size ? tokenValue(size.name) : undefined,
                  fontWeight: weight ? tokenValue(weight.name) : undefined,
                  lineHeight: lineHeight
                    ? tokenValue(lineHeight.name)
                    : undefined,
                  letterSpacing: letterSpacing
                    ? tokenValue(letterSpacing.name)
                    : undefined,
                }}
              >
                {sample}
              </div>
            </Stack>
            <CodeText>{size?.name ?? role}</CodeText>
          </Card>
        );
      })}
    </Stack>
  );
}

function DensityCategory({ category }: { category: DesignTokenCategory }) {
  return (
    <div className="vf-docs-token-density-specimens">
      {(["sm", "md", "lg"] as const).map((size) => (
        <Card
          className="vf-docs-token-density-specimen"
          key={size}
          padding="sm"
          variant="bordered"
        >
          <Text className="vf-docs-catalog__kicker" size="sm">
            {size}
          </Text>
          <Button size={size}>Action</Button>
          <CodeText>{`--vf-control-height-${size}`}</CodeText>
        </Card>
      ))}
      <Card
        className="vf-docs-token-density-specimen"
        padding="sm"
        variant="bordered"
      >
        <Text className="vf-docs-catalog__kicker" size="sm">
          minimum target
        </Text>
        <span
          className="vf-docs-token-hit-target"
          style={{
            width: tokenValue("--vf-hit-target-min"),
            height: tokenValue("--vf-hit-target-min"),
          }}
        >
          AA
        </span>
        <CodeText>--vf-hit-target-min</CodeText>
      </Card>
    </div>
  );
}

function MotionCategory({ category }: { category: DesignTokenCategory }) {
  const durations = category.tokens.filter((item) =>
    item.name.includes("duration"),
  );
  return (
    <Stack className="vf-docs-token-motion-specimens" gap="sm">
      {durations.map((item) => (
        <Card
          className="vf-docs-token-motion-specimen"
          key={item.name}
          padding="sm"
          variant="bordered"
        >
          <div
            className="vf-docs-token-motion-specimen__track"
            style={{ animationDuration: tokenValue(item.name) }}
          >
            <span />
          </div>
          <CodeText>{item.name}</CodeText>
        </Card>
      ))}
    </Stack>
  );
}

function LayerCategory({ category }: { category: DesignTokenCategory }) {
  return (
    <div className="vf-docs-token-layer-specimen">
      {category.tokens.slice(0, 8).map((item, index) => (
        <Card
          className="vf-docs-token-layer-specimen__item"
          key={item.name}
          padding="sm"
          variant="bordered"
          style={{
            transform: `translate(${index * 16}px, ${index * -8}px)`,
            zIndex: tokenValue(item.name),
          }}
        >
          <span>{item.name.replace("--vf-layer-", "")}</span>
          <CodeText>{item.name}</CodeText>
        </Card>
      ))}
    </div>
  );
}

function GenericCategory({ category }: { category: DesignTokenCategory }) {
  return (
    <DescriptionList className="vf-docs-token-role-list">
      {category.tokens.flatMap((item) => [
        <dt key={`${item.name}-term`}>
          <CodeText>{item.name}</CodeText>
        </dt>,
        <dd key={`${item.name}-description`}>
          <Text size="sm" tone="muted">
            {item.purpose}
          </Text>
        </dd>,
      ])}
    </DescriptionList>
  );
}

function CategorySpecimen({ category }: { category: DesignTokenCategory }) {
  if (
    ["surface", "text", "border", "interactive", "status"].includes(category.id)
  ) {
    return <ColorCategory category={category} />;
  }
  if (category.id === "typography") {
    return <TypographyCategory category={category} />;
  }
  if (category.id === "density") {
    return <DensityCategory category={category} />;
  }
  if (category.id === "motion") {
    return <MotionCategory category={category} />;
  }
  if (category.id === "layer") {
    return <LayerCategory category={category} />;
  }
  return <GenericCategory category={category} />;
}

export function ReferenceTokenGallery({
  categories,
}: {
  categories: readonly DesignTokenCategory[];
}) {
  return (
    <Stack className="vf-docs-token-gallery" gap="lg">
      {categories.map((category) => (
        <Card
          className="vf-docs-token-category"
          key={category.id}
          padding="lg"
          variant="bordered"
        >
          <div className="vf-docs-token-category__heading">
            <Stack gap="xs">
              <Text className="vf-docs-catalog__kicker" size="sm">
                {category.tokens.length} canonical tokens
              </Text>
              <Heading level={3} size="md">
                {category.id}
              </Heading>
              <Text tone="muted">{category.purpose}</Text>
            </Stack>
            <a href={`#/token-reference/${category.id}`}>
              Inspect variables <span aria-hidden="true">→</span>
            </a>
          </div>
          <CategorySpecimen category={category} />
        </Card>
      ))}
    </Stack>
  );
}
