import { Badge, Heading, Text } from "@vyrnforge/ui-components";
import {
  referenceComponents,
  referenceElements,
  referencePackages,
  referenceReleaseLines,
} from "../../data/referenceMetadata";

function labelFromId(value: string) {
  return value
    .split(/[-_]/g)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

const componentCategories = Array.from(
  new Set(referenceComponents.map((component) => component.category)),
).sort();

const elementFamilies = Array.from(
  new Set(referenceElements.map((element) => element.family)),
).sort();

export function ComponentsCatalogPage() {
  return (
    <section className="vf-playground-panel">
      <div className="vf-playground-section-heading">
        <div>
          <Heading size="md">Canonical component catalog</Heading>
          <Text tone="muted">
            Component identity, package ownership, maturity, availability, and
            purpose are generated from canonical VyrnForge consumer knowledge for
            this exact playground snapshot.
          </Text>
        </div>
        <Badge tone="subtle">{referenceComponents.length} components</Badge>
      </div>

      {componentCategories.map((category) => {
        const components = referenceComponents.filter(
          (component) => component.category === category,
        );

        return (
          <section className="vf-playground-section" key={category}>
            <div className="vf-playground-section-heading">
              <Heading size="sm">{labelFromId(category)}</Heading>
              <Badge tone="subtle">{components.length}</Badge>
            </div>
            <div className="vf-playground-token-grid">
              {components.map((component) => (
                <div className="vf-playground-token-card" key={component.id}>
                  <strong>{component.displayName}</strong>
                  <code>{component.id}</code>
                  <div className="vf-playground-demo-page__badges">
                    <Badge tone="subtle">{component.maturity}</Badge>
                    <Badge tone="subtle">{component.availability}</Badge>
                  </div>
                  {component.package ? <code>{component.package}</code> : null}
                  <Text size="sm" tone="muted">
                    {component.purpose}
                  </Text>
                </div>
              ))}
            </div>
          </section>
        );
      })}
    </section>
  );
}

export function NativeElementsCatalogPage() {
  return (
    <section className="vf-playground-panel">
      <div className="vf-playground-section-heading">
        <div>
          <Heading size="md">Native element catalog</Heading>
          <Text tone="muted">
            Registered Custom Elements are composed from the canonical core and
            advanced native-element programs captured by this playground version.
          </Text>
        </div>
        <Badge tone="subtle">{referenceElements.length} elements</Badge>
      </div>

      {elementFamilies.map((family) => {
        const elements = referenceElements.filter(
          (element) => element.family === family,
        );

        return (
          <section className="vf-playground-section" key={family}>
            <div className="vf-playground-section-heading">
              <Heading size="sm">{labelFromId(family)}</Heading>
              <Badge tone="subtle">{elements.length}</Badge>
            </div>
            <div className="vf-playground-token-grid">
              {elements.map((element) => (
                <div className="vf-playground-token-card" key={element.tag}>
                  <code>{`<${element.tag}>`}</code>
                  <div className="vf-playground-demo-page__badges">
                    <Badge tone="subtle">{element.wave}</Badge>
                    <Badge tone="subtle">{element.family}</Badge>
                  </div>
                  <Text size="sm" tone="muted">
                    {element.package}
                  </Text>
                </div>
              ))}
            </div>
          </section>
        );
      })}
    </section>
  );
}

export function PackagesVersionsCatalogPage() {
  return (
    <section className="vf-playground-panel">
      <div className="vf-playground-section-heading">
        <div>
          <Heading size="md">Packages and versions</Heading>
          <Text tone="muted">
            Package purpose and runtime come from generated consumer knowledge;
            deployed version relationships come from the canonical release-group
            contract in this snapshot.
          </Text>
        </div>
        <Badge tone="subtle">{referencePackages.length} packages</Badge>
      </div>

      {referenceReleaseLines.map((releaseLine) => (
        <section className="vf-playground-section" key={releaseLine.id}>
          <div className="vf-playground-section-heading">
            <div>
              <Heading size="sm">{releaseLine.id}</Heading>
              <Text tone="muted">{releaseLine.intent}</Text>
            </div>
            <div className="vf-playground-demo-page__badges">
              <Badge tone="subtle">{releaseLine.channel}</Badge>
              <Badge tone="subtle">{releaseLine.version}</Badge>
              <Badge tone="subtle">{releaseLine.distTag}</Badge>
            </div>
          </div>

          <div className="vf-playground-token-grid">
            {referencePackages
              .filter((packageReference) =>
                releaseLine.packages.includes(packageReference.name),
              )
              .map((packageReference) => (
                <div
                  className="vf-playground-token-card"
                  key={packageReference.name}
                >
                  <strong>{packageReference.name}</strong>
                  <div className="vf-playground-demo-page__badges">
                    <Badge tone="subtle">{packageReference.runtime}</Badge>
                    <Badge tone="subtle">{packageReference.status}</Badge>
                  </div>
                  <code>{packageReference.version ?? "unversioned"}</code>
                  <Text size="sm" tone="muted">
                    {packageReference.purpose}
                  </Text>
                  {packageReference.cssImport !== "not-applicable" ? (
                    <code>{packageReference.cssImport}</code>
                  ) : null}
                </div>
              ))}
          </div>
        </section>
      ))}
    </section>
  );
}
