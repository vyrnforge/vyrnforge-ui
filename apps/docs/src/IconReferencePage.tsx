import {
  vyrnForgeIconNames,
  vyrnForgeIconSizePixels,
  type VyrnForgeIconName,
  type VyrnForgeIconSizeName,
} from "@vyrnforge/ui-core";
import {
  Button,
  Heading,
  Icon,
  SearchInput,
  Text,
} from "@vyrnforge/ui-components";
import { useMemo, useState } from "react";

import type { DocsFrameworkId } from "./docsContext";

type IconReferencePageProps = {
  frameworkId: DocsFrameworkId;
};

const frameworkLabels: Record<DocsFrameworkId, string> = {
  "native-html": "Native HTML",
  react: "React",
  angular: "Angular",
  vue: "Vue",
};

function iconUsage(frameworkId: DocsFrameworkId, name: VyrnForgeIconName) {
  if (frameworkId === "react") {
    return `import { Icon } from "@vyrnforge/ui-components";\n\n<Icon name="${name}" />`;
  }
  if (frameworkId === "angular") {
    return `import { VfIcon } from "@vyrnforge/ui-angular";\n\n// Add VfIcon to the component imports.\n<vf-icon vfGeneratedIcon name="${name}"></vf-icon>`;
  }
  if (frameworkId === "vue") {
    return `<script setup lang="ts">\nimport { VfIcon } from "@vyrnforge/ui-vue";\n</script>\n\n<template>\n  <VfIcon name="${name}" />\n</template>`;
  }
  return `<vf-icon name="${name}"></vf-icon>`;
}

function decorativeUsage(
  frameworkId: DocsFrameworkId,
  name: VyrnForgeIconName,
) {
  if (frameworkId === "react") return `<Icon name="${name}" />`;
  if (frameworkId === "angular") {
    return `<vf-icon vfGeneratedIcon name="${name}"></vf-icon>`;
  }
  if (frameworkId === "vue") return `<VfIcon name="${name}" />`;
  return `<vf-icon name="${name}"></vf-icon>`;
}

export function IconReferencePage({ frameworkId }: IconReferencePageProps) {
  const [query, setQuery] = useState("");
  const [selectedIcon, setSelectedIcon] = useState<VyrnForgeIconName>("Search");
  const [copyState, setCopyState] = useState<"idle" | "copied" | "failed">(
    "idle",
  );

  const filteredIcons = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase();
    if (!normalizedQuery) return [...vyrnForgeIconNames];
    return vyrnForgeIconNames.filter((name) =>
      name.toLocaleLowerCase().includes(normalizedQuery),
    );
  }, [query]);

  const usage = iconUsage(frameworkId, selectedIcon);

  async function copyUsage() {
    try {
      if (!navigator.clipboard) throw new Error("Clipboard API unavailable");
      await navigator.clipboard.writeText(usage);
      setCopyState("copied");
    } catch {
      setCopyState("failed");
    }
  }

  return (
    <div className="vf-docs-icon-reference">
      <section
        className="vf-docs-icon-browser"
        aria-labelledby="icon-browser-title"
      >
        <div className="vf-docs-icon-browser__heading">
          <div>
            <Heading id="icon-browser-title" level={2} size="md">
              Icon catalog
            </Heading>
            <Text tone="muted">
              One SVG catalog shared by Native HTML, React, Angular, and Vue.
            </Text>
          </div>
          <Text className="vf-docs-icon-browser__count" size="sm" tone="muted">
            {vyrnForgeIconNames.length} icons
          </Text>
        </div>

        <SearchInput
          aria-label="Search icons"
          onChange={(event) => setQuery(event.currentTarget.value)}
          placeholder="Search icons…"
          value={query}
          wrapperClassName="vf-docs-icon-browser__search"
        />

        <Text
          aria-live="polite"
          className="vf-docs-icon-browser__results"
          size="sm"
          tone="muted"
        >
          {query.trim()
            ? `${filteredIcons.length} of ${vyrnForgeIconNames.length} icons`
            : "Select an icon to inspect usage and supported sizes."}
        </Text>

        {filteredIcons.length > 0 ? (
          <div
            className="vf-docs-icon-grid"
            role="list"
            aria-label="VyrnForge icons"
          >
            {filteredIcons.map((name) => (
              <div role="listitem" key={name}>
                <Button
                  aria-pressed={selectedIcon === name}
                  className="vf-docs-icon-tile"
                  onClick={() => {
                    setSelectedIcon(name);
                    setCopyState("idle");
                  }}
                  type="button"
                  variant="ghost"
                >
                  <Icon name={name} size={24} />
                  <span>{name}</span>
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div className="vf-docs-icon-browser__empty">
            <Heading level={3} size="sm">
              No matching icons
            </Heading>
            <Text tone="muted">Try another name or clear the search.</Text>
          </div>
        )}
      </section>

      <section
        className="vf-docs-icon-detail"
        aria-labelledby="selected-icon-title"
      >
        <div className="vf-docs-icon-detail__heading">
          <div>
            <Text className="vf-docs-catalog__kicker" size="sm">
              Selected icon
            </Text>
            <Heading id="selected-icon-title" level={2} size="md">
              {selectedIcon}
            </Heading>
          </div>
          <Text size="sm" tone="muted">
            @vyrnforge/ui-core
          </Text>
        </div>

        <div
          className="vf-docs-icon-detail__preview"
          aria-label={`${selectedIcon} icon preview`}
        >
          <Icon name={selectedIcon} size={64} />
        </div>

        <div className="vf-docs-icon-detail__section">
          <div>
            <Heading level={3} size="sm">
              Sizes
            </Heading>
            <Text tone="muted">
              Named sizes resolve from the shared icon foundation.
            </Text>
          </div>
          <div className="vf-docs-icon-sizes">
            {Object.entries(vyrnForgeIconSizePixels).map(([size, pixels]) => (
              <figure className="vf-docs-icon-size" key={size}>
                <div className="vf-docs-icon-size__preview">
                  <Icon
                    name={selectedIcon}
                    size={size as VyrnForgeIconSizeName}
                  />
                </div>
                <figcaption>
                  <strong>{size}</strong>
                  <span>{pixels}px</span>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>

        <div className="vf-docs-icon-detail__section">
          <div className="vf-docs-icon-code__heading">
            <div>
              <Heading level={3} size="sm">
                {frameworkLabels[frameworkId]} usage
              </Heading>
              <Text tone="muted">
                Code follows the framework selected in the Reference navigation.
              </Text>
            </div>
            <Button
              onClick={() => void copyUsage()}
              size="sm"
              type="button"
              variant="subtle"
            >
              {copyState === "copied"
                ? "Copied"
                : copyState === "failed"
                  ? "Copy failed"
                  : "Copy code"}
            </Button>
          </div>
          <pre className="vf-docs-icon-code">
            <code>{usage}</code>
          </pre>
        </div>

        <div className="vf-docs-icon-detail__section vf-docs-icon-a11y">
          <div>
            <Heading level={3} size="sm">
              Accessibility
            </Heading>
            <Text tone="muted">
              Keep decorative icons hidden from assistive technology. When an
              icon carries meaning, pair it with visible text or an accessible
              name on the interactive control.
            </Text>
          </div>
          <div className="vf-docs-icon-a11y__examples">
            <div>
              <strong>Decorative</strong>
              <code>{decorativeUsage(frameworkId, selectedIcon)}</code>
            </div>
            <div>
              <strong>Icon-only action</strong>
              <code>{`aria-label="${selectedIcon}"`}</code>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
